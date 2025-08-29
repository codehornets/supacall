import { getPresignedUrlForGet } from "../lib/file"
import { prisma } from "../lib/db"
import { convertPdfToImages } from "../lib/pdf"
import { MemoryService } from "./memory.service"
import logger from "../lib/logger"
import { OpenAI } from "openai"

export class IndexerService {

    static async imageToMarkdown(url: string) {

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        })

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that converts images to markdown."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `
                                Convert the text in the image to markdown. 
                                If any charts are present, convert them to tables. 
                                For images generate description of the image.    
                            `
                        },
                        {
                            type: "image_url",
                            image_url: {
                                "url": url,
                            },
                        },
                    ],
                }
            ]
        })

        return response.choices[0].message.content || ""
    }


    static async indexKnowledgeBase(knowledgeBaseId: string) {
        try {
            const agentKnowledge = await prisma.agentKnowledge.findFirstOrThrow({
                where: {
                    id: knowledgeBaseId
                }
            })

            if(agentKnowledge.indexStatus !== "PENDING" && agentKnowledge.indexStatus !== "FAILED") {
                return
            } 

            await prisma.agentKnowledge.update({
                where: {
                    id: knowledgeBaseId
                },
                data: {
                    indexStatus: "INDEXING"
                }
            })

            const file = await getPresignedUrlForGet(agentKnowledge.file)

            const images = await convertPdfToImages(file.url, agentKnowledge.file)

            for (const image of images) {
                const imageFile = await getPresignedUrlForGet(image)
                const referenceText = await this.imageToMarkdown(imageFile.url)
                const indexId = await MemoryService.indexTextToVectorDB(
                    referenceText, 
                    agentKnowledge.organizationId, 
                    agentKnowledge.id
                )

                await prisma.agentKnowledgeIndex.create({
                    data: {
                        id: indexId,
                        agentKnowledgeId: knowledgeBaseId,
                        referenceText: referenceText,
                        referenceImage: imageFile.filename,
                        organizationId: agentKnowledge.organizationId,
                    }
                })
            }

            await prisma.agentKnowledge.update({
                where: {
                    id: knowledgeBaseId
                },
                data: {
                    indexStatus: "INDEXED"
                }
            })


        } catch (err) {
            await prisma.agentKnowledge.update({
                where: {
                    id: knowledgeBaseId
                },
                data: {
                    indexStatus: "FAILED"
                }
            })

            console.error(err)

            logger.error(`Failed to index source of ${knowledgeBaseId}`)
            logger.error(err)
        }
    }
}