const express = require('express')
const multer = require('multer')
const router = express.Router()
const { apiKeyVerify } = require('../middlewares/authorization.js')
const { processRequestBody } = require('../middlewares/chat-middleware.js')
const { handleChatCompletion } = require('../controllers/chat.js')
const {
    handleImageVideoCompletion,
    handleOpenAIImagesGeneration,
    handleOpenAIImagesEdit,
    handleOpenAIVideoGeneration
} = require('../controllers/chat.image.video.js')

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024
    }
})

const selectChatCompletion = (req, res, next) => {
    const ChatCompletionMap = {
        't2t': handleChatCompletion,
        'search': handleChatCompletion,
        't2i': handleImageVideoCompletion,
        't2v': handleImageVideoCompletion,
        'image_edit': handleImageVideoCompletion,
        //   'deep_research': handleDeepResearchCompletion
    }

    const chatType = req.body.chat_type
    const chatCompletion = ChatCompletionMap[chatType]
    if (chatCompletion) {
        chatCompletion(req, res, next)
    } else {
        handleImageVideoCompletion(req, res, next)
    }
}

router.post('/v1/chat/completions',
    apiKeyVerify,
    processRequestBody,
    selectChatCompletion
)

// 容错路由：处理客户端误将 /v1/chat/completions 当做 BaseURL 导致拼接出双重路径的情况
router.post('/v1/chat/completions/chat/completions',
    apiKeyVerify,
    processRequestBody,
    selectChatCompletion
)

// 容错路由：处理客户端省略 /v1 路径的情况
router.post('/chat/completions',
    apiKeyVerify,
    processRequestBody,
    selectChatCompletion
)

router.post('/v1/images/generations',
    apiKeyVerify,
    handleOpenAIImagesGeneration
)

router.post('/v1/images/edits',
    apiKeyVerify,
    upload.any(),
    handleOpenAIImagesEdit
)

router.post('/v1/videos',
    apiKeyVerify,
    upload.any(),
    handleOpenAIVideoGeneration
)


module.exports = router
