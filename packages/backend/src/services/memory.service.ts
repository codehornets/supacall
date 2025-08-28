import { getWeaviateClient } from "../lib/weaviate"
import { OpenAI } from "openai"
import { WeaviateClient } from "weaviate-client"

export class MemoryService {
    static async createTenantOrCollectionIfNotExists(client: WeaviateClient, collectionName: string, organizationId: string) {

        const collectionExists = await client.collections.exists(collectionName)

        if (!collectionExists) {
            await client.collections.create({
                name: collectionName,
                multiTenancy: {
                    enabled: true
                },
                properties: [
                    {
                        name: "source",
                        dataType: "text",
                        indexFilterable: true,
                        indexSearchable: true,
                        tokenization: "word"
                    }
                ]
            })
        }

        const tenant = await client.collections.get(collectionName).tenants.getByName(organizationId)

        if (!tenant) {
            await client.collections.get(collectionName).tenants.create({
                name: organizationId,
                activityStatus: "ACTIVE"
            })
        }
    }


    static async indexTextToVectorDB(text: string, organizationId: string, sourceId: string) {

        const client = await getWeaviateClient()

        await MemoryService.createTenantOrCollectionIfNotExists(client, "Documents", organizationId)

        const collection = client.collections.get("Documents").withTenant(organizationId)

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        })

        const embedding = await openai.embeddings.create({
            input: text,
            model: "text-embedding-3-small"
        })

        const result = await collection.data.insert({
            properties: {
                source: sourceId
            },
            vectors: embedding.data[0].embedding,
        })

        return result

    }

    static async queryVectorDB(text: string, organizationId: string, sourceId: string | null = null) {
        const client = await getWeaviateClient()

        await MemoryService.createTenantOrCollectionIfNotExists(client, "Documents", organizationId)

        const collection = client.collections.get("Documents").withTenant(organizationId)

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        })

        const embedding = await openai.embeddings.create({
            input: text,
            model: "text-embedding-3-small"
        })

        const result = await collection.query.nearVector(embedding.data[0].embedding, {
            limit: 1,
            filters: sourceId ? {
                target: {
                    property: "source"
                },
                operator: "Equal",
                value: sourceId
            } : undefined
        })

        return result.objects.length > 0 ? result.objects[0].uuid : ""
    }


    static async deleteVectorIndex(indexId: string, organizationId: string) {

        const client = await getWeaviateClient()

        await MemoryService.createTenantOrCollectionIfNotExists(client, "Documents", organizationId)

        const collection = client.collections.get("Documents").withTenant(organizationId)

        await collection.data.deleteById(indexId)

        return
    }
}