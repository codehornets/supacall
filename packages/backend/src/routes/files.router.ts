import Router from "express"
import { getPresignedUrlForGet, getPresignedUrlForUpload } from "../lib/file"
import logger from "../lib/logger"

const router = Router()

router.get("/presigned-url-for-get", async (req, res) => {
    try {
        const { filename } = req.query
        const presignedUrl = await getPresignedUrlForGet(filename as string)
        res.json(presignedUrl)
        return
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error: "Internal server error" })
        return
    }
})

router.get("/presigned-url-for-upload", async (req, res) => {
    try {
        const { filename } = req.query
        const presignedUrl = await getPresignedUrlForUpload(filename as string)
        res.json(presignedUrl)
        return
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error: "Internal server error" })
        return
    }
})

export default router
