const { Transform } = require('stream');

class UppercaseStream extends Transform {
    _transform(chunk, encoding, callback) {
        const text = chunk.toString();
        const upperText = text.toUpperCase();
        console.log(`[Uppercase Log]: ${upperText.trim()}`);
        this.push(upperText);
        callback();
    }
}

class StatsStream extends Transform {
    _transform(chunk, encoding, callback) {
        const text = chunk.toString();
        const cleanText = text.trim();

        if (cleanText) {
            const charCount = cleanText.length;
            const words = cleanText.split(/\s+/);
            const wordCount = words.length;
            console.log(`[Stats Log]: Текст: "${cleanText}"`);
            console.log(`[Stats Log]: Статистика -> Слів: ${wordCount}, Символів: ${charCount}`);
        }
        this.push(text);
        callback();
    }
}

class HighlightStream extends Transform {
    constructor(keywordColors, numberColor, options) {
        super(options);
        this.keywordColors = keywordColors;
        this.numberColor = numberColor;
        this.resetColor = '\x1b[0m';
    }

    _transform(chunk, encoding, callback) {
        let text = chunk.toString();
        
        // Підсвітка чисел
        if (this.numberColor) {
            text = text.replace(/(\d+)/g, `${this.numberColor}$1${this.resetColor}`);
        }

        // Підсвітка ключових слів
        for (const [word, color] of Object.entries(this.keywordColors)) {
            const regex = new RegExp(`\\b(${word})\\b`, 'gi');
            text = text.replace(regex, `${color}$1${this.resetColor}`);
        }
        
        console.log(`[Highlight Log]: ${text.trim()}`);
        this.push(text);
        callback();
    }
}

const ANSI_COLORS = {
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    CYAN: '\x1b[36m'
};

const keywords = {
    'error': ANSI_COLORS.RED,
    'success': ANSI_COLORS.GREEN,
    'info': ANSI_COLORS.BLUE
};

const numbersColor = ANSI_COLORS.YELLOW;

const uppercaseStream = new UppercaseStream();
const statsStream = new StatsStream();
const highlightStream = new HighlightStream(keywords, numbersColor);

// Ланцюжок: вхід -> великі літери -> статистика -> підсвітка -> вихід у консоль
process.stdin
    .pipe(uppercaseStream)
    .pipe(statsStream)
    .pipe(highlightStream)
    .pipe(process.stdout);