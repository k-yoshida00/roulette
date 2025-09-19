document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('rouletteCanvas');
    const ctx = canvas.getContext('2d');
    const spinBtn = document.getElementById('spinBtn');
    const resultText = document.getElementById('resultText');

    // 10個の静的な選択肢を設定
    const options = [
        '最近の「ちょっと嬉しかったこと」ってある？',
        'スマホの待ち受け、何にしてる？',
        '学生時代の「変なバイト」or「印象的なバイト」',
        '今朝食べたもの、覚えてる？',
        '最近観た映画・ドラマ・アニメでおすすめある？',
        '地元あるある or 方言ってある？',
        '「社会人になったらやってみたいこと」ってある？',
        '自分を「○○っぽい人」って言うなら？（例：犬っぽい、夜型っぽい）',
        '最近の「やらかしエピソード」ある？（笑える範囲で）',
        'もし1週間休みがあったら何をする？'
    ];
    let currentRotation = 0;
    let spinning = false;
    
    // テキストを複数行で描画する関数（改良版）
    const drawText = (text, x, maxWidth, lineHeight, maxLines = 1) => {
        const chars = text.split('');
        let line = '';
        const lines = [];

        for (let n = 0; n < chars.length; n++) {
            const testLine = line + chars[n];
            if (ctx.measureText(testLine).width > maxWidth) {
                // 最後の行に達している場合は切り詰めて省略記号を付ける
                if (lines.length + 1 === maxLines) {
                    let truncated = line;
                    // '...' を入れても収まるように短くする
                    while (truncated.length > 0 && ctx.measureText(truncated + '...').width > maxWidth) {
                        truncated = truncated.slice(0, -1);
                    }
                    lines.push(truncated + '...');
                    break;
                } else {
                    lines.push(line);
                    line = chars[n];
                }
            } else {
                line = testLine;
            }
        }

        if (lines.length < maxLines && line !== '') {
            lines.push(line);
        }

        // 垂直方向に中央揃えして描画（セグメント中央から均等に上下へ）
        const totalHeight = lines.length * lineHeight;
        const startY = -totalHeight / 2 + lineHeight / 2;

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i].trim(), x, startY + i * lineHeight);
        }
    };

    const drawRoulette = () => {
        if (options.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        const segmentAngle = (2 * Math.PI) / options.length;
        const colors = ['#f56565', '#4299e1', '#48bb78', '#ecc94b', '#9f7aea', '#ed8936', '#e53e3e', '#3182ce', '#667eea', '#4fd1c5'];
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < options.length; i++) {
            const startAngle = i * segmentAngle;
            const endAngle = startAngle + segmentAngle;
            ctx.beginPath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.lineTo(centerX, centerY);
            ctx.fill();

            // テキスト描画
            ctx.save();
            ctx.translate(centerX, centerY);
            const textAngle = startAngle + segmentAngle / 2;
            ctx.rotate(textAngle);
            ctx.fillStyle = '#1a202c';
            ctx.font = '16px Inter';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';

            const lineHeight = 20;
            const maxWidth = radius - 40;
            const textRadius = radius - 10;

            drawText(options[i], textRadius, maxWidth, lineHeight, 1);

            ctx.restore();
        }
    };
    
    const spin = () => {
        spinning = true;
        spinBtn.disabled = true;
        resultText.textContent = '';
        
        const randomAngle = Math.floor(Math.random() * 360) + 360 * 5;
        const startRotation = currentRotation; // 追加: アニメーションの開始角度を記録
        const finalRotation = currentRotation + randomAngle;
        const duration = 5000;
        const startTime = performance.now();
        
        const animateSpin = (timestamp) => {
            const elapsedTime = timestamp - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easing = (1 - Math.cos(progress * Math.PI)) / 2;
            // 修正: 開始角度から最終角度へ補間する
            const rotation = startRotation + (finalRotation - startRotation) * easing;
            
            canvas.style.transform = `rotate(${rotation}deg)`;
            
            if (progress < 1) {
                requestAnimationFrame(animateSpin);
            } else {
                spinning = false;
                spinBtn.disabled = false;
                currentRotation = finalRotation % 360;
                canvas.style.transform = `rotate(${currentRotation}deg)`;
                showResult();
            }
        };
        
        requestAnimationFrame(animateSpin);
    };

    const showResult = () => {
        if (options.length === 0) {
            resultText.textContent = '選択肢がありません';
            return;
        }
        
        const totalRotation = currentRotation;
        const normalizedRotation = (totalRotation % 360 + 360) % 360;
        // 修正: 矢印（270°）位置から現在回転を引く（向きの補正）
        const adjustedRotation = (270 - normalizedRotation + 360) % 360;

        const sectorSize = 360 / options.length;
        const resultIndex = Math.floor(adjustedRotation / sectorSize);
        
        const result = options[resultIndex];
        
        resultText.textContent = `結果: ${result}`;
    };

    spinBtn.addEventListener('click', () => {
        if (!spinning) {
            spin();
        }
    });

    window.addEventListener('resize', () => {
        const container = document.querySelector('.roulette-container');
        const size = Math.min(container.clientWidth, container.clientHeight);
        canvas.width = size;
        canvas.height = size;
        drawRoulette();
    });

    // 初期描画
    window.dispatchEvent(new Event('resize'));
});