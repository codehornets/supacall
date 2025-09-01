import { Application } from "express-ws"
import { Router } from "express"
import { validateRequest } from "zod-express-middleware"
import { z } from "zod"
import { WebSocket } from "ws"
import { AgentsService } from "../services/agents.service"
import twilio from "twilio"
import { prisma } from "../lib/db"
import { ConversationsService } from "../services/conversations.service"
import { ExecutorService } from "../services/executor.service"
import Redis from "ioredis"
import { OPENAI_API_KEY, REDIS_URL, TWILIO_WEBHOOK_DOMAIN } from "../lib/constants"

const router = Router()

interface TwilioMessage {
    event: string;
    sequenceNumber?: string;
    media?: {
        track: string;
        chunk: string;
        timestamp: string;
        payload: string;
    };
    start?: {
        streamSid: string;
        accountSid: string;
        callSid: string;
        tracks: string[];
        mediaFormat: {
            encoding: string;
            sampleRate: number;
            channels: number;
        };
    };
    mark?: {
        name: string;
    };
    stop?: {
        accountSid: string;
        callSid: string;
    };
}

interface OpenAIRealtimeMessage {
    type: string;
    event_id?: string;
    session?: any;
    response?: any;
    item?: any;
    audio?: string;
    transcript?: string;
    arguments?: string;
    call_id?: string;
    name?: string;
    delta?: any;
}

export function usePhoneCallRouter(app: Application) {
    app.ws("/phone-call", (ws: WebSocket, req) => {
        console.log('New Twilio WebSocket connection established');

        let openaiWs: WebSocket | null = null;
        let streamSid: string | null = null;
        let callSid: string | null = null;
        let accountSid: string | null = null;
        let silenceTimer: NodeJS.Timeout | null = null;
        let hasSpoken = false;
        let conversationStarted = false;
        let twilioClient: twilio.Twilio | null = null;
        let agentId: string | null = null;
        let organizationId: string | null = null;
        let phoneNumber: string | null = null;
        let conversationId: string | null = null;
        let redis = new Redis(REDIS_URL);

        // Silence handling functions
        const startSilenceTimer = () => {
            clearSilenceTimer();
            silenceTimer = setTimeout(() => {
                if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
                    const silencePrompts = [
                        "Is there anything specific I can help you with today?",
                        "Are you still there? How can I assist you?",
                        "I'm here to help. What questions do you have?",
                        "Feel free to ask me anything about our products or services.",
                        "What would you like to know more about?"
                    ];

                    const randomPrompt = silencePrompts[Math.floor(Math.random() * silencePrompts.length)];

                    // Create a text input to trigger a response
                    const textInput = {
                        type: 'conversation.item.create',
                        item: {
                            type: 'message',
                            role: 'user',
                            content: [{
                                type: 'input_text',
                                text: `[INTERNAL_SILENCE_PROMPT: Please respond naturally to break the silence with: "${randomPrompt}"]`
                            }]
                        }
                    };

                    openaiWs.send(JSON.stringify(textInput));
                    openaiWs.send(JSON.stringify({ type: 'response.create' }));
                }
            }, hasSpoken ? 8000 : 3000); // 8 seconds after user has spoken, 3 seconds initially
        };

        const clearSilenceTimer = () => {
            if (silenceTimer) {
                clearTimeout(silenceTimer);
                silenceTimer = null;
            }
        };

        const sendInitialGreeting = () => {
            if (openaiWs && openaiWs.readyState === WebSocket.OPEN && !conversationStarted) {
                conversationStarted = true;

                const greetings = [
                    "Hello! Thanks for calling. How can I help you today?",
                    "Hi there! I'm here to assist you. What can I do for you?",
                    "Good day! I'm your AI assistant. How may I help you today?",
                    "Hello! I'm here to help with any questions you might have. What's on your mind?"
                ];

                const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

                // Create initial greeting
                const greetingInput = {
                    type: 'conversation.item.create',
                    item: {
                        type: 'message',
                        role: 'user',
                        content: [{
                            type: 'input_text',
                            text: `[INITIAL_GREETING: Please greet the caller with: "${randomGreeting}"]`
                        }]
                    }
                };

                openaiWs.send(JSON.stringify(greetingInput));
                openaiWs.send(JSON.stringify({ type: 'response.create' }));

                // Start silence timer after greeting
                startSilenceTimer();
            }
        };


        const initializeAgent = async () => {

            if(!accountSid || !callSid) {
                return
            }

            const twilioSettingsForAccountSid = await prisma.agentTwilio.findFirst({
                where: {
                    accountSid: accountSid
                }
            })

            if (!twilioSettingsForAccountSid) {
                return
            }

            // Configure twilio
            twilioClient = twilio(
                twilioSettingsForAccountSid.accountSid, 
                twilioSettingsForAccountSid.authToken
            )

            const call = await twilioClient.calls(callSid).fetch()
            
            phoneNumber = call.direction === "inbound" ? call.from : call.to

            // Find the agent based on the phone number
            const twilioConfigAgent = await prisma.agentTwilio.findFirst({
                where: {
                    phoneNumber: phoneNumber
                }
            })

            if(!twilioConfigAgent) {
                return
            }

            agentId = twilioConfigAgent.agentId
            organizationId = twilioConfigAgent.organizationId

            const conversation = await ConversationsService.createConversation(
                agentId, 
                phoneNumber, 
                organizationId
            )

            conversationId = conversation.id

            await redis.psubscribe(`__keyspace@0__:conversation:${conversationId}`)
            redis.on("pmessage", async (pattern, channel, message) => {
                const conversation = await redis.get(`conversation:${conversationId}`)
                if(conversation) {
                    const conversationData = JSON.parse(conversation)
                    if(conversationData[-1].type === "human_feedback") {
                        if(openaiWs) {
                            openaiWs.send(JSON.stringify({
                                type: "conversation.item.create",
                                item: {
                                    type: "message",
                                    role: "user",
                                    content: [{
                                        type: "text",
                                        text: conversationData[conversationData.length - 1].content
                                    }]
                                }
                            }))
                            openaiWs.send(JSON.stringify({
                                type: "response.create"
                            }))
                        }
                    }
                }
            })
        }

        const initializeOpenAI = () => {
            const openaiUrl = 'wss://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview';

            openaiWs = new WebSocket(openaiUrl, {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'OpenAI-Beta': 'realtime=v1'
                }
            });

            openaiWs.on('open', () => {
                console.log('Connected to OpenAI Realtime API');

                // Configure the session
                const sessionUpdate = {
                    type: 'session.update',
                    session: {
                        modalities: ['text', 'audio'],
                        instructions: `You are a helpful voice sales agent. 
                        You are integrated with an inventory agent tool.
                        You need to keep track of enquiries upon the inventory item mentioned.
                        
                        IMPORTANT: When you receive messages starting with [INTERNAL_SILENCE_PROMPT:] or [INITIAL_GREETING:], 
                        respond naturally with the suggested text, but make it sound conversational and engaging.
                        Don't mention that this is an internal prompt.`,
                        voice: 'alloy',
                        input_audio_format: 'g711_ulaw',
                        output_audio_format: 'g711_ulaw',
                        input_audio_transcription: {
                            model: 'whisper-1'
                        },
                        turn_detection: {
                            type: 'server_vad',
                            threshold: 0.5,
                            prefix_padding_ms: 300,
                            silence_duration_ms: 500
                        },
                        tools: [
                            {
                                type: 'function',
                                name: 'phone_agent',
                                description: `Access the agent to get information`,
                                parameters: {
                                    type: 'object',
                                    properties: {
                                        query: {
                                            type: 'string',
                                            description: 'The user inquiry or request'
                                        }
                                    },
                                    required: ['query']
                                }
                            },
                            {
                                type: "function",
                                name: "call_end",
                                description: "Call this function when the user wants to end the call or you want to end the call",
                                parameters: {
                                    type: "object",
                                    properties: {
                                        reason: {}
                                    }
                                }
                            },
                            {
                                type: "function",
                                name: "update_recent_enquiries",
                                description: "Update the recent enquiries whenever inventory item is mentioned",
                                parameters: {
                                    type: "object",
                                    properties: {
                                        item_and_reason: {
                                            type: "string",
                                            description: "The item and reason for updating the recent enquiries"
                                        }
                                    },
                                    required: ["item_and_reason"]
                                }
                            }
                        ],
                        tool_choice: 'auto'
                    }
                };

                openaiWs?.send(JSON.stringify(sessionUpdate));
            });

            openaiWs.on('message', async (data: Buffer) => {
                try {
                    const message: OpenAIRealtimeMessage = JSON.parse(data.toString());

                    switch (message.type) {
                        case 'session.created':
                            console.log('OpenAI session created');
                            // Send initial greeting after session is created
                            setTimeout(() => sendInitialGreeting(), 1000);
                            break;

                        case 'response.audio.delta':
                            // Send audio back to Twilio
                            if (message.delta && streamSid) {
                                const audioMessage = {
                                    event: 'media',
                                    streamSid: streamSid,
                                    media: {
                                        payload: message.delta
                                    }
                                };
                                ws.send(JSON.stringify(audioMessage));
                            }
                            break;

                        case 'response.function_call_arguments.done':
                            // Handle function call
                            if (message.name === 'phone_agent' && message.arguments) {
                                try {

                                    if(!agentId || !conversationId) {
                                        throw new Error("Agent or conversation not found")
                                    }

                                    // Do Call The agent Here
                                    const result = await ExecutorService.execute(agentId, conversationId)

                                    // Send function result back to OpenAI
                                    const functionResult = {
                                        type: 'conversation.item.create',
                                        item: {
                                            type: 'function_call_output',
                                            call_id: message.call_id,
                                            output: result
                                        }
                                    };
                                    openaiWs?.send(JSON.stringify(functionResult));
                                } catch (error) {
                                    const functionResult = {
                                        type: 'conversation.item.create',
                                        item: {
                                            type: 'function_call_output',
                                            call_id: message.call_id,
                                            output: "Error handling function call"
                                        }
                                    };
                                    openaiWs?.send(JSON.stringify(functionResult));
                                    console.error('Error handling function call:', error);
                                } finally {
                                    openaiWs?.send(JSON.stringify({ type: 'response.create' }));
                                }
                            }

                            if (message.name === "call_end") {
                                // End the call
                                if (twilioClient && callSid) {
                                    try {
                                        await twilioClient.calls(callSid).update({ status: 'completed' });

                                        console.log('Call ended successfully');

                                        // Close OpenAI connection
                                        if (openaiWs) {
                                            openaiWs.close();
                                            openaiWs = null;
                                        }

                                        // Clear silence timer
                                        clearSilenceTimer();

                                        // Close Twilio WebSocket
                                        ws.close();
                                    } catch (error) {
                                        console.error('Error ending call:', error);
                                    }
                                }
                            }

                            break;

                        case 'input_audio_buffer.speech_started':
                            console.log('User started speaking');
                            hasSpoken = true;
                            clearSilenceTimer(); // Stop silence timer when user speaks

                            // Stop any ongoing audio playback to Twilio
                            if (streamSid) {
                                const clearMessage = {
                                    event: 'clear',
                                    streamSid: streamSid
                                };
                                ws.send(JSON.stringify(clearMessage));
                            }
                            break;

                        case 'transcript':
                            if (message.transcript && conversationId) {
                                // Store user's transcript
                                await ConversationsService.syncConversation(conversationId, {
                                    role: 'user',
                                    content: message.transcript
                                });
                            }
                            break;

                        case 'input_audio_buffer.speech_stopped':
                            console.log('User stopped speaking');
                            // Start silence timer when user stops speaking
                            startSilenceTimer();
                            break;

                        case 'response.text.delta':
                            // Accumulate assistant's response
                            if (message.delta && conversationId) {
                                await ConversationsService.syncConversation(conversationId, {
                                    role: 'assistant',
                                    content: message.delta
                                });
                            }
                            break;

                        case 'response.audio.done':
                            console.log('AI finished speaking');
                            // Restart silence timer after AI finishes speaking
                            startSilenceTimer();
                            break;

                        case 'error':
                            console.error('OpenAI error:', message);
                            break;

                        default:
                            // Log other message types for debugging
                            console.log('OpenAI message type:', message.type);
                    }
                } catch (error) {
                    console.error('Error processing OpenAI message:', error);
                }
            });

            openaiWs.on('error', (error: any) => {
                console.error('OpenAI WebSocket error:', error);
            });

            openaiWs.on('close', () => {
                console.log('OpenAI WebSocket connection closed');
            });
        };

        // Handle Twilio messages
        ws.on('message', (message: Buffer) => {
            try {
                const data: TwilioMessage = JSON.parse(message.toString());

                switch (data.event) {
                    case 'connected':
                        console.log('Twilio connected');
                        break;

                    case 'start':
                        console.log('Media stream started');
                        streamSid = data.start?.streamSid || null;
                        callSid = data.start?.callSid || null;
                        accountSid = data.start?.accountSid || null;
                        // Create a new conversation
                        initializeAgent();

                        // Initialize OpenAI connection when stream starts
                        initializeOpenAI();
                        break;

                    case 'media':
                        // Forward audio to OpenAI
                        if (data.media?.payload && openaiWs && openaiWs.readyState === WebSocket.OPEN) {
                            const audioMessage = {
                                type: 'input_audio_buffer.append',
                                audio: data.media.payload
                            };
                            openaiWs.send(JSON.stringify(audioMessage));
                        }
                        break;

                    case 'mark':
                        console.log('Mark received:', data.mark?.name);
                        break;

                    case 'stop':
                        console.log('Media stream stopped');
                        // Close OpenAI connection
                        if (openaiWs) {
                            openaiWs.close();
                            openaiWs = null;
                        }
                        break;

                    default:
                        console.log('Unknown Twilio event:', data.event);
                }
            } catch (error) {
                console.error('Error processing Twilio message:', error);
            }
        });

        ws.on('close', () => {
            console.log('Twilio WebSocket connection closed');
            // Clean up timers and OpenAI connection
            if(redis) {
                redis.disconnect()
            }
            clearSilenceTimer();
            if (openaiWs) {
                openaiWs.close();
                openaiWs = null;
            }
        });

        ws.on('error', (error: any) => {
            console.error('Twilio WebSocket error:', error);
        });

        // Send initial connected message
        ws.send(JSON.stringify({
            event: 'connected',
            protocol: 'Call'
        }));
    });
}


router.post("/incoming-call", async (req, res) => {
    res.type("text/xml")
    res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Say language="en">This call might be recorded or monitored for quality assurance purposes</Say><Connect><Stream url="wss://${TWILIO_WEBHOOK_DOMAIN}/phone-call" /></Connect></Response>`)
    return
})


router.post(
    "/outbound-call",
    validateRequest({
        body: z.object({
            agentId: z.uuid(),
            phoneNumber: z.string().min(1)
        })
    }),
    async (req, res) => {
        const { phoneNumber, agentId } = req.body

        const agent = await AgentsService.getAgentById(agentId, res.locals.org)

        if (!agent) {
            res.status(400).json({
                message: "Agent not found"
            })
            return
        }

        const twilioSettings = await AgentsService.getTwilioSettings(agent.id)

        if (!twilioSettings) {
            res.status(400).json({
                message: "Phone number not set"
            })
            return
        }

        const twilioClient = twilio(twilioSettings.accountSid, twilioSettings.authToken)

        await twilioClient.calls.create({
            from: twilioSettings.phoneNumber,
            to: phoneNumber,
            twiml: `<?xml version="1.0" encoding="UTF-8"?><Response><Say language="en">This call might be recorded or monitored for quality assurance purposes</Say><Connect><Stream url="wss://${TWILIO_WEBHOOK_DOMAIN}/phone-call" /></Connect></Response>`
        })

        res.status(200).json({
            message: "Call initiated"
        })
        return
    }
)

export default router