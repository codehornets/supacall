import weaviate, { WeaviateClient } from "weaviate-client"
import { WEAVIATE_API_KEY, WEAVIATE_LOCAL_URL, WEAVIATE_URL } from "./constants"

export async function getWeaviateClient(): Promise<WeaviateClient> {

    if (WEAVIATE_LOCAL_URL) {
        return await weaviate.connectToLocal({
            host: WEAVIATE_LOCAL_URL.split(":")[0],
            port: parseInt(WEAVIATE_LOCAL_URL.split(":")[1])
        })
    }

    return await weaviate.connectToWeaviateCloud(WEAVIATE_URL, {
        authCredentials: new weaviate.ApiKey(WEAVIATE_API_KEY)
    })
}
