from openai import OpenAI
import json

client = OpenAI(
    base_url="http://localhost:3000/v1",
    api_key="sk-123456"
)

# 1. 定义工具
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取城市天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "城市名称，如：北京"}
                },
                "required": ["city"]
            }
        }
    }
]

# 2. 调用 qwen3.8-Max 模型
response = client.chat.completions.create(
    model="qwen3.8-Max",
    messages=[
        {"role": "user", "content": "查一下北京的天气"}
    ],
    tools=tools,
    tool_choice="required"
)

# 3. 解析 tool_calls
message = response.choices[0].message
if message.tool_calls:
    tool_call = message.tool_calls[0]
    print("✅ 成功发起工具调用：", tool_call.function.name)
    print("👉 工具参数：", tool_call.function.arguments)