// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const englishNameInput = document.getElementById('english-name');
    const generateBtn = document.getElementById('generate-btn');
    const loadingElement = document.getElementById('loading');
    const resultsSection = document.getElementById('results-section');
    const namesContainer = document.getElementById('names-container');
    const header = document.querySelector('header');
    
    // 添加页面加载动画
    document.body.classList.add('loaded');
    
    // 为标题添加打字机效果
    const title = document.querySelector('h1');
    const subtitle = document.querySelector('h2');
    if (title && subtitle) {
        const titleText = title.textContent;
        const subtitleText = subtitle.textContent;
        title.textContent = '';
        subtitle.textContent = '';
        
        // 打字机效果函数
        function typeWriter(element, text, i, callback) {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                setTimeout(function() {
                    typeWriter(element, text, i + 1, callback);
                }, 100);
            } else if (callback) {
                setTimeout(callback, 500);
            }
        }
        
        // 执行标题打字机效果
        setTimeout(() => {
            typeWriter(title, titleText, 0, function() {
                typeWriter(subtitle, subtitleText, 0);
            });
        }, 500);
    }
    
    // 为输入框添加焦点动画
    englishNameInput.addEventListener('focus', function() {
        this.classList.add('input-focus');
    });
    
    englishNameInput.addEventListener('blur', function() {
        this.classList.remove('input-focus');
    });
    
    // 为生成按钮添加悬停效果
    generateBtn.addEventListener('mouseenter', function() {
        this.classList.add('btn-hover');
    });
    
    generateBtn.addEventListener('mouseleave', function() {
        this.classList.remove('btn-hover');
    });
    
    // 添加按钮点击波纹效果
    generateBtn.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
    
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
            showNotification('请输入您的英文名！', 'error');
            return;
        }
        
        // 显示加载动画，禁用按钮
        loadingElement.style.display = 'flex';
        generateBtn.disabled = true;
        resultsSection.style.display = 'none';
        
        // 添加加载动画粒子效果
        createLoadingParticles();
        
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
            
            // 移除加载动画粒子
            removeLoadingParticles();
            
            // 显示结果
            displayResults(namesData);
            
            // 显示成功通知
            showNotification('中文名生成成功！', 'success');
            
        } catch (error) {
            // 处理错误
            console.error('生成名字时出错:', error);
            showNotification(`生成名字时出错: ${error.message}`, 'error');
            
            // 移除加载动画粒子
            removeLoadingParticles();
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
            // 为每个名字创建卡片，并添加延迟显示动画
            data.names.forEach((name, index) => {
                const nameCard = document.createElement('div');
                nameCard.className = 'name-card';
                nameCard.style.opacity = '0';
                nameCard.style.transform = 'translateY(20px)';
                
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
                    
                    <div class="card-glow"></div>
                `;
                
                // 添加卡片点击效果
                nameCard.addEventListener('click', function() {
                    // 移除其他卡片的选中状态
                    document.querySelectorAll('.name-card').forEach(card => {
                        card.classList.remove('selected');
                    });
                    
                    // 添加当前卡片的选中状态
                    this.classList.add('selected');
                    
                    // 创建选中动画
                    const chars = name.chinese.split('');
                    const charContainer = document.createElement('div');
                    charContainer.className = 'floating-chars';
                    
                    chars.forEach(char => {
                        const charElem = document.createElement('span');
                        charElem.textContent = char;
                        charElem.style.animationDelay = `${Math.random() * 2}s`;
                        charContainer.appendChild(charElem);
                    });
                    
                    // 移除之前的浮动字符
                    const oldChars = document.querySelector('.floating-chars');
                    if (oldChars) {
                        oldChars.remove();
                    }
                    
                    // 添加新的浮动字符
                    document.body.appendChild(charContainer);
                    
                    // 5秒后移除浮动字符
                    setTimeout(() => {
                        charContainer.remove();
                    }, 5000);
                });
                
                namesContainer.appendChild(nameCard);
                
                // 延迟显示卡片，创建级联效果
                setTimeout(() => {
                    nameCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    nameCard.style.opacity = '1';
                    nameCard.style.transform = 'translateY(0)';
                }, 300 * index);
            });
            
            // 显示结果区域
            resultsSection.style.display = 'block';
            
            // 滚动到结果区域，添加平滑滚动效果
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // 如果没有有效的名字数据
            showNotification('无法获取有效的名字数据，请重试。', 'error');
        }
    }
    
    // 创建加载动画粒子效果
    function createLoadingParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'loading-particles';
        
        // 创建20个粒子
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // 随机位置和大小
            const size = Math.random() * 10 + 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            // 随机颜色
            const hue = Math.random() * 60 + 330; // 紫色到红色范围
            particle.style.backgroundColor = `hsl(${hue}, 100%, 60%)`;
            
            // 随机动画延迟
            particle.style.animationDelay = `${Math.random() * 2}s`;
            
            particlesContainer.appendChild(particle);
        }
        
        loadingElement.appendChild(particlesContainer);
    }
    
    // 移除加载动画粒子
    function removeLoadingParticles() {
        const particles = document.querySelector('.loading-particles');
        if (particles) {
            particles.remove();
        }
    }
    
    // 显示通知函数
    function showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 3秒后隐藏通知
        setTimeout(() => {
            notification.classList.remove('show');
            
            // 动画结束后移除元素
            notification.addEventListener('transitionend', function() {
                notification.remove();
            });
        }, 3000);
    }
    
    // 添加背景粒子效果
    function createBackgroundParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'background-particles';
        
        // 创建50个背景粒子
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'bg-particle';
            
            // 随机位置、大小和透明度
            const size = Math.random() * 15 + 3;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.top = `${Math.random() * 100}vh`;
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            
            // 随机颜色
            const hue = Math.random() * 60 + 330; // 紫色到红色范围
            particle.style.backgroundColor = `hsl(${hue}, 100%, 70%)`;
            
            // 随机动画持续时间和延迟
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 5;
            particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
            
            particlesContainer.appendChild(particle);
        }
        
        document.body.appendChild(particlesContainer);
    }
    
    // 创建背景粒子
    createBackgroundParticles();
    
    // 添加页面滚动动画效果
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        
        // 标题视差效果
        if (header) {
            header.style.transform = `translateY(${scrollPosition * 0.3}px)`;
        }
        
        // 为可见元素添加动画
        const elements = document.querySelectorAll('.input-section, .name-card');
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenHeight = window.innerHeight;
            
            if (elementPosition < screenHeight * 0.8) {
                element.classList.add('animate-in');
            }
        });
    });
});