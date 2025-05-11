// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const englishNameInput = document.getElementById('english-name');
    const generateBtn = document.getElementById('generate-btn');
    const loadingElement = document.getElementById('loading');
    const resultsSection = document.getElementById('results-section');
    const namesContainer = document.getElementById('names-container');
    
    // API配置
    const API_KEY = 'sk-fxzpovadpmmxstwexgpvtwyxwqxwbvrcfimgegisqrbojdkz';
    const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
    const MODEL = 'deepseek-ai/DeepSeek-R1';
    
    // 监听生成按钮点击事件
    generateBtn.addEventListener('click', generateChineseNames);
    
    // 生成中文名函数
    async function generateChineseNames() {
        // 获取用户输入的英文名
        const englishName = englishNameInput.value.trim();
        
        // 验证输入
        if (!englishName) {
            alert('请输入您的英文名！');
            return;
        }
        
        // 显示加载动画，禁用按钮
        loadingElement.style.display = 'flex';
        generateBtn.disabled = true;
        resultsSection.style.display = 'none';
        
        try {
            // 构建API请求
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        {
                            role: 'system',
                            content: `你是一位精通中国文化和语言的专家，擅长为外国人创建有意义的中文名字。请为用户生成三个独特的中文名，每个名字都应该：
                            1. 与用户的英文名有一定的音译或含义联系
                            2. 体现中国传统文化元素
                            3. 发音优美，寓意吉祥
                            4. 适合现代使用
                            
                            对于每个名字，请提供：
                            - 中文名（汉字）
                            - 拼音（带声调）
                            - 中文解释（解释每个字的含义和文化背景）
                            - 英文解释（翻译名字的含义给英语使用者）
                            - 文化参考（相关的中国文化元素、诗词或典故）
                            
                            请以JSON格式返回结果，格式如下：
                            {
                              "names": [
                                {
                                  "chinese": "中文名1",
                                  "pinyin": "拼音1",
                                  "meaning_cn": "中文解释1",
                                  "meaning_en": "英文解释1",
                                  "cultural_reference": "文化参考1"
                                },
                                {
                                  "chinese": "中文名2",
                                  "pinyin": "拼音2",
                                  "meaning_cn": "中文解释2",
                                  "meaning_en": "英文解释2",
                                  "cultural_reference": "文化参考2"
                                },
                                {
                                  "chinese": "中文名3",
                                  "pinyin": "拼音3",
                                  "meaning_cn": "中文解释3",
                                  "meaning_en": "英文解释3",
                                  "cultural_reference": "文化参考3"
                                }
                              ]
                            }`
                        },
                        {
                            role: 'user',
                            content: `请为英文名"${englishName}"生成三个有意义的中文名。`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });
            
            // 处理API响应
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message || '生成名字时出错');
            }
            
            // 解析AI返回的内容
            const aiResponse = data.choices[0].message.content;
            let namesData;
            
            try {
                // 尝试解析JSON响应
                // 有时AI可能会在JSON前后添加额外文本，我们需要提取JSON部分
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    namesData = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('无法解析AI响应');
                }
            } catch (parseError) {
                console.error('解析AI响应时出错:', parseError);
                throw new Error('解析AI响应时出错');
            }
            
            // 显示结果
            displayResults(namesData);
            
        } catch (error) {
            // 处理错误
            console.error('生成名字时出错:', error);
            alert(`生成名字时出错: ${error.message}`);
        } finally {
            // 隐藏加载动画，启用按钮
            loadingElement.style.display = 'none';
            generateBtn.disabled = false;
        }
    }
    
    // 显示结果函数
    function displayResults(data) {
        // 清空之前的结果
        namesContainer.innerHTML = '';
        
        // 确保我们有名字数据
        if (data && data.names && Array.isArray(data.names)) {
            // 为每个名字创建卡片
            data.names.forEach(name => {
                const nameCard = document.createElement('div');
                nameCard.className = 'name-card';
                
                nameCard.innerHTML = `
                    <div class="chinese-name">${name.chinese}</div>
                    <div class="pinyin">${name.pinyin}</div>
                    
                    <div class="meaning">
                        <h4>中文解释:</h4>
                        <p>${name.meaning_cn}</p>
                    </div>
                    
                    <div class="meaning">
                        <h4>English Meaning:</h4>
                        <p>${name.meaning_en}</p>
                    </div>
                    
                    <div class="cultural-reference">
                        <p>${name.cultural_reference}</p>
                    </div>
                `;
                
                namesContainer.appendChild(nameCard);
            });
            
            // 显示结果区域
            resultsSection.style.display = 'block';
            
            // 滚动到结果区域
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            // 如果没有有效的名字数据
            alert('无法获取有效的名字数据，请重试。');
        }
    }
});