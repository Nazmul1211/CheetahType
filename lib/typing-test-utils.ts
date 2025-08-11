export interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  elapsedTime: number;
  consistency: number;
  wpmHistory: number[];
  errors: number[];  // Positions where errors occurred
}

export type TestMode = 'time' | 'words' | 'quote' | 'zen' | 'custom' | 'punctuation' | 'numbers';
export type TimeOption = 15 | 30 | 60 | 120 | 180 | 240 | 300 | number;
export type WordsOption = 10 | 25 | 50 | 100 | number;

const commonWords = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'cheetah', 'you', 'do', 'at', 
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'cheetah', 'time', 'no', 'just', 'him', 'know', 'take', 
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 
  'than', 'then', 'than','cheetahtype', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'cheetah', 'new', 'want', 'because', 'any', 'cheetah', 'type', 'these', 'give', 'day', 'most', 'us',
  'world', 'life', 'hand', 'part', 'eye', 'place', 'case', 'point', 'government', 'company',
  'number', 'group', 'problem', 'fact', 'money', 'issue', 'area', 'family', 'example', 'while',
  'state', 'something', 'nothing', 'course', 'school', 'still', 'learn', 'cheetah', 'plant', 'cover', 'food',
  'water', 'friend', 'call', 'minute', 'find', 'word', 'drive', 'carry', 'done', 'talk',
  'house', 'home', 'side', 'own', 'read', 'play', 'spell', 'add', 'much', 'must',
  'land', 'here', 'big', 'act', 'why', 'cheetahtype', 'ask', 'men', 'went', 'light', 'kind',
  'need', 'try', 'name', 'help', 'line', 'turn', 'again', 'air', 'boy', 'follow',
  'stop', 'cheetah', 'came', 'river', 'car', 'feet', 'care', 'book', 'idea', 'city', 'build',
  'self', 'earth', 'left', 'late', 'run', 'form', 'end', 'same', 'too', 'does',
  'tell', 'song', 'cheetah', 'type', 'mile', 'body', 'dog', 'whole', 'hear', 'answer', 'room', 'between',
  'cheetah', 'type', 'test', 'word', 'sentence', 'paragraph', 'article', 'book', 'story', 'novel',
  'essay', 'report', 'letter', 'email', 'message', 'note', 'memo', 'document', 'file', 'folder',
  'computer', 'keyboard', 'mouse', 'monitor', 'printer', 'scanner', 'projector', 'speaker', 'microphone',
  'camera', 'phone', 'tablet', 'laptop', 'desktop', 'server', 'network', 'internet', 'email', 'message',
  'note', 'memo', 'document', 'file', 'folder', 'computer', 'cheetah', 'type', 'keyboard', 'mouse', 'monitor', 'printer', 'scanner', 'projector', 'speaker', 'microphone', 'camera', 'phone', 'tablet', 'laptop', 'desktop',
  'server', 'network', 'internet', 'email', 'message', 'note', 'memo', 'document', 'file', 'folder',
  'cheetah', 'type', 'test', 'word', 'sentence', 'paragraph', 'article', 'book', 'story', 'novel',
  'essay', 'report', 'letter', 'email', 'message', 'note', 'memo', 'document', 'file', 'folder',
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'cheetah', 'type', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'cheetah', 'type', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'water', 'long', 'find', 'here', 'thing', 'great', 'little', 'right', 'old', 'tell', 'boy', 'did', 'follow', 'act', 'why', 'ask', 'men', 'change', 'went', 'light', 'kind', 'off', 'need', 'house', 'picture', 'try', 'again', 'animal', 'point', 'mother', 'world', 'near', 'build', 'self', 'earth', 'father', 'head', 'stand', 'own', 'page', 'should', 'country', 'found', 'answer', 'school', 'grow', 'study', 'still', 'learn', 'plant', 'cover', 'food', 'sun', 'four', 'between', 'state', 'keep', 'eye', 'never', 'last', 'let', 'thought', 'city', 'tree', 'cross', 'farm', 'hard', 'start', 'might', 'story', 'saw', 'far', 'sea', 'draw', 'left', 'late', 'run', 'while', 'press', 'close', 'night', 'cheetah', 'type', 'real', 'life', 'few', 'north', 'open', 'seem', 'together', 'next', 'white', 'children', 'end', 'got', 'walk', 'example', 'begin', 'took', 'river', 'mountain', 'stop', 'once', 'base', 'hear', 'horse', 'cut', 'sure', 'watch', 'color', 'face', 'wood', 'main', 'enough', 'plain', 'girl', 'usual', 'young', 'ready', 'above', 'ever', 'red', 'list', 'though', 'feel', 'talk', 'bird', 'soon', 'body', 'dog', 'family', 'direct', 'leave', 'song', 'measure', 'door', 'product', 'black', 'short', 'numeral', 'class', 'wind', 'question', 'happen', 'complete', 'ship', 'area', 'half', 'rock', 'order', 'fire', 'south', 'problem', 'piece', 'told', 'knew', 'pass', 'since', 'top', 'whole', 'king', 'space', 'heard', 'best', 'hour', 'better', 'during', 'cheetah', 'type', 'hundred', 'five', 'remember', 'step', 'early', 'hold', 'west', 'ground', 'interest', 'reach', 'fast', 'verb', 'sing', 'listen', 'six', 'table', 'travel', 'less', 'morning', 'ten', 'simple', 'several', 'vowel', 'toward', 'war', 'lay', 'against', 'pattern', 'slow', 'center', 'love', 'person', 'money', 'serve', 'appear', 'road', 'map', 'rain', 'rule', 'govern', 'pull', 'cold', 'notice', 'voice', 'unit', 'power', 'town', 'fine', 'certain', 'fly', 'fall', 'lead', 'cry', 'dark', 'machine', 'note', 'wait', 'plan', 'figure', 'star', 'box', 'noun', 'field', 'cheetah', 'type', 'rest', 'correct', 'able', 'pound', 'done', 'beauty', 'drive', 'stood', 'contain', 'front', 'teach', 'week', 'final', 'gave', 'green', 'oh', 'quick', 'develop', 'ocean', 'warm', 'free', 'minute', 'strong', 'special', 'mind', 'behind', 'clear', 'tail', 'produce', 'fact', 'street', 'inch', 'multiply', 'nothing', 'course', 'stay', 'wheel', 'full', 'force', 'blue', 'object', 'decide', 'surface', 'deep', 'moon', 'island', 'foot', 'system', 'busy', 'test', 'record', 'boat', 'common', 'gold', 'possible', 'plane', 'stead', 'dry', 'wonder', 'laugh', 'thousands', 'ago', 'ran', 'check', 'game', 'shape', 'equate', 'hot', 'miss', 'brought', 'heat', 'snow', 'tire', 'bring', 'yes', 'distant', 'fill', 'east', 'paint', 'language', 'among', 'grand', 'ball', 'cheetah', 'type', 'yet', 'wave', 'drop', 'heart', 'am', 'present', 'heavy', 'dance', 'engine', 'position', 'arm', 'wide', 'sail', 'material', 'size', 'vary', 'settle', 'speak', 'weight', 'general', 'ice', 'matter', 'circle', 'pair', 'include', 'divide', 'syllable', 'felt', 'perhaps', 'pick', 'sudden', 'count', 'square', 'reason', 'length', 'represent', 'art', 'subject', 'region', 'energy', 'hunt', 'probable', 'cheetah', 'type', 'bed', 'brother', 'egg', 'ride', 'cell', 'believe', 'fraction', 'forest', 'sit', 'race', 'window', 'store', 'summer', 'train', 'sleep', 'prove', 'lone', 'leg', 'exercise', 'wall', 'catch', 'mount', 'wish', 'sky', 'board', 'joy', 'winter', 'sat', 'written', 'wild', 'instrument', 'kept', 'glass', 'grass', 'cow', 'job', 'edge', 'sign', 'visit', 'past', 'soft', 'fun', 'bright', 'gas', 'weather', 'month', 'million', 'bear', 'finish', 'happy', 'hope', 'flower', 'clothe', 'strange', 'gone', 'jump', 'baby', 'eight', 'village', 'meet', 'root', 'buy', 'raise', 'solve', 'metal', 'whether', 'push', 'seven', 'paragraph', 'third', 'shall', 'held', 'hair', 'describe', 'cook', 'floor', 'either', 'result', 'burn', 'hill', 'safe', 'cat', 'century', 'consider', 'type', 'law', 'bit', 'coast', 'copy', 'phrase', 'silent', 'tall', 'sand', 'soil', 'roll', 'temperature', 'finger', 'industry', 'value', 'fight', 'lie', 'beat', 'excite', 'natural', 'view', 'cheetah', 'type', 'sense', 'ear', 'else', 'quite', 'broke', 'case', 'middle', 'kill', 'son', 'lake', 'moment', 'scale', 'loud', 'spring', 'observe', 'child', 'straight', 'consonant', 'nation', 'dictionary', 'milk', 'speed', 'method', 'organ', 'pay', 'age', 'section', 'dress', 'cloud', 'surprise', 'quiet', 'stone', 'tiny', 'climb', 'bad', 'oil', 'blood', 'touch', 'grew', 'cent', 'mix', 'team', 'wire', 'cost', 'lost', 'brown', 'wear', 'garden', 'equal', 'sent', 'choose', 'fell', 'fit', 'flow', 'fair', 'bank', 'collect', 'save', 'control', 'decimal', 'gentle', 'woman', 'captain', 'practice', 'separate', 'difficult', 'doctor', 'please', 'protect', 'noon', 'whose', 'locate', 'ring', 'character', 'insect', 'caught', 'period', 'indicate', 'radio', 'spoke', 'atom', 'human', 'history', 'effect', 'electric', 'expect', 'crop', 'modern', 'element', 'hit', 'student', 'corner', 'cheetah', 'type', 'party', 'supply', 'bone', 'rail', 'imagine', 'provide', 'agree', 'thus', 'capital', 'chair', 'danger', 'fruit', 'rich', 'thick', 'soldier', 'process', 'operate', 'guess', 'necessary', 'sharp', 'wing', 'create', 'neighbor', 'wash', 'bat', 'rather', 'crowd', 'corn', 'compare', 'poem', 'string', 'bell', 'depend', 'meat', 'rub', 'tube', 'famous', 'dollar', 'stream', 'fear', 'sight', 'thin', 'triangle', 'planet', 'hurry', 'chief', 'colony', 'clock', 'mine', 'tie', 'enter', 'major', 'fresh', 'search', 'send', 'yellow', 'gun', 'allow', 'print', 'dead', 'spot', 'desert', 'suit', 'current', 'lift', 'rose', 'continue', 'block', 'chart', 'hat', 'cheetah', 'type', 'sell', 'success', 'company', 'subtract', 'event', 'particular', 'deal', 'swim', 'term', 'opposite', 'wife', 'shoe', 'shoulder', 'spread', 'arrange', 'camp', 'invent', 'cotton', 'born', 'determine', 'quart', 'nine', 'truck', 'noise', 'level', 'chance', 'gather', 'shop', 'stretch', 'throw', 'shine', 'property', 'column', 'molecule', 'select', 'wrong', 'gray', 'repeat', 'require', 'broad', 'prepare', 'salt', 'nose', 'plural', 'anger', 'claim', 'continent', 'oxygen', 'sugar', 'death', 'pretty', 'skill', 'women', 'season', 'solution', 'magnet', 'silver', 'thank', 'branch', 'match', 'suffix', 'especially', 'fig', 'afraid', 'huge', 'sister', 'steel', 'discuss', 'forward', 'similar', 'guide', 'experience', 'score', 'apple', 'bought', 'cheetah', 'type', 'led', 'pitch', 'coat', 'mass', 'card', 'band', 'rope', 'slip', 'win', 'dream', 'evening', 'condition', 'feed', 'tool', 'total', 'basic', 'smell', 'valley', 'nor', 'double', 'seat', 'arrive', 'master', 'track', 'parent', 'shore', 'division', 'sheet', 'substance', 'favor', 'connect', 'post', 'spend', 'chord', 'fat', 'glad', 'original', 'share', 'station', 'dad', 'bread', 'charge', 'proper', 'bar', 'offer', 'segment', 'slave', 'duck', 'instant', 'market', 'degree', 'populate', 'chick', 'dear', 'enemy', 'reply', 'drink', 'occur', 'support', 'speech', 'nature', 'range', 'steam', 'motion', 'path', 'liquid', 'log', 'meant', 'quotient', 'teeth', 'shell', 'neck', 'table', 'phone', 'book', 'car', 'run', 'house', 'tree', 'water', 'food', 'hand', 'cheetah', 'type', 'place', 'work', 'school', 'name', 'home', 'big', 'small', 'long', 'short', 'high', 'low', 'fast', 'slow', 'hot', 'cold', 'happy', 'sad', 'good', 'bad', 'yes', 'no', 'hello', 'goodbye', 'please', 'thank', 'sorry', 'excuse', 'help', 'stop', 'go', 'come', 'walk', 'talk', 'listen', 'look', 'see', 'hear', 'eat', 'drink', 'sleep', 'wake', 'play', 'learn', 'teach', 'read', 'write', 'draw', 'sing', 'dance', 'laugh', 'cry', 'smile', 'cheetah', 'type', 'love', 'like', 'want', 'need', 'buy', 'sell', 'give', 'take', 'send', 'get', 'put', 'bring', 'carry', 'hold', 'catch', 'throw', 'push', 'pull', 'open', 'close', 'start', 'stop', 'finish', 'begin', 'end', 'left', 'right', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'near', 'far', 'here', 'there', 'today', 'tomorrow', 'yesterday', 'morning', 'evening', 'night', 'day', 'week', 'month', 'year', 'time', 'clock', 'hour', 'minute', 'second', 'early', 'late', 'now', 'then', 'soon', 'always', 'never', 'sometimes', 'often', 'cheetah', 'type', 'usually', 'maybe', 'perhaps', 'sure', 'possible', 'impossible', 'easy', 'hard', 'difficult', 'simple', 'quick', 'slow', 'heavy', 'light', 'strong', 'weak', 'full', 'empty', 'clean', 'dirty', 'new', 'old', 'young', 'beautiful', 'ugly', 'safe', 'dangerous', 'quiet', 'loud', 'soft', 'hard', 'smooth', 'rough', 'sweet', 'sour', 'bitter', 'salty', 'fresh', 'stale', 'warm', 'cool', 'dry', 'wet', 'sharp', 'dull', 'bright', 'dark', 'clear', 'cloudy', 'sunny', 'rainy', 'windy', 'snowy', 'rich', 'poor', 'expensive', 'cheap', 'free', 'busy', 'lazy', 'tired', 'energetic', 'sick', 'healthy', 'hungry', 'thirsty', 'full', 'empty', 'angry', 'cheetah', 'type', 'calm', 'excited', 'bored', 'interested', 'surprised', 'worried', 'relaxed', 'nervous', 'confident', 'shy', 'friendly', 'rude', 'polite', 'kind', 'mean', 'generous', 'selfish', 'honest', 'dishonest', 'brave', 'scared', 'careful', 'careless', 'patient', 'impatient', 'funny', 'serious', 'silly', 'smart', 'stupid', 'wise', 'cheetah', 'type', 'foolish', 'lucky', 'unlucky', 'famous', 'unknown', 'popular', 'unpopular', 'important', 'unimportant', 'necessary', 'unnecessary', 'useful', 'useless', 'helpful', 'harmful', 'dangerous', 'safe', 'correct', 'wrong', 'true', 'false', 'real', 'fake', 'original', 'copy', 'same', 'different', 'similar', 'opposite', 'cheetah', 'type', 'equal', 'unequal', 'fair', 'unfair', 'normal', 'strange', 'weird', 'common', 'rare', 'special', 'ordinary', 'amazing', 'boring', 'interesting', 'exciting', 'scary', 'funny', 'sad', 'happy', 'angry', 'surprised', 'worried', 'relaxed', 'comfortable', 'uncomfortable', 'pleasant', 'unpleasant', 'wonderful', 'terrible', 'great', 'awful', 'excellent', 'poor', 'perfect', 'imperfect', 'complete', 'incomplete', 'successful', 'unsuccessful', 'positive', 'negative', 'public', 'private', 'personal', 'professional', 'cheetah', 'type', 'formal', 'informal', 'official', 'unofficial', 'legal', 'illegal', 'local', 'foreign', 'domestic', 'international', 'global', 'national', 'regional', 'urban', 'rural', 'modern', 'traditional', 'ancient', 'future', 'past', 'present', 'temporary', 'permanent', 'natural', 'artificial', 'wild', 'tame', 'alive', 'dead', 'active', 'inactive', 'mobile', 'immobile', 'flexible', 'rigid', 'solid', 'liquid', 'gas', 'frozen', 'melted', 'boiled', 'cooked', 'raw', 'ripe', 'unripe', 'mature', 'immature', 'adult', 'child', 'baby', 'cheetah', 'type', 'teenager', 'elderly', 'middle-aged', 'married', 'single', 'divorced', 'widowed', 'male', 'female', 'human', 'animal', 'plant', 'mineral', 'metal', 'wood', 'plastic', 'glass', 'paper', 'cloth', 'leather', 'rubber', 'stone', 'brick', 'concrete', 'sand', 'dirt', 'mud', 'dust', 'smoke', 'fire', 'flame', 'ash', 'coal', 'oil', 'gas', 'electricity', 'energy', 'power', 'force', 'strength', 'speed', 'movement', 'motion', 'direction', 'distance', 'length', 'width', 'height', 'depth', 'size', 'weight', 'mass', 'volume', 'capacity', 'amount', 'quantity', 'number', 'count', 'total', 'sum', 'average', 'maximum', 'minimum', 'half', 'quarter', 'third', 'double', 'triple', 'single', 'multiple', 'few', 'several', 'many', 'most', 'all', 'none', 'some', 'any', 'each', 'every', 'both', 'either', 'neither', 'other', 'another', 'next', 'previous', 'first', 'last', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'hundred', 'thousand', 'million', 'billion', 'cheetah', 'type',
];

const punctuationWords = [
  "Don't forget to bring your lunch!", 
  "What's the weather like today?",
  "The cat's toy is under the table.",
  "Hey! Watch where you're going!",
  "She said, 'I'll be there soon.'",
  "Is this the right way? I'm not sure.",
  "Stop, look, and listen!",
  "The meeting starts at 9:30 a.m.",
  "Please bring: cups, plates, and napkins.",
  "Wow! That's amazing!",
  "He asked, \"Why did you do that?\"",
  "The sign reads, \"No parking at any time.\"",
  "We need to consider options A, B, and C.",
  "I can't believe it's already Friday!",
  "Do you know where the post office is?",
  "That's great news! Congratulations!",
  "The movie was good; however, the book was better.",
  "Pack the following items: shirts, socks, and shoes.",
  "Wait—did you hear that noise?",
  "My flight leaves at 6:45 p.m.",
  "Remember: practice makes perfect!",
  "There are three categories: beginner, intermediate, and advanced.",
  "She whispered, \"This is our secret; don't tell anyone.\"",
  "Can you believe it? We won the championship!",
  "The restaurant—which was highly recommended—was actually quite disappointing.",
  "First, preheat the oven; then, prepare the ingredients.",
  "The museum is closed on Mondays, but it's open on weekends (10:00 a.m. to 6:00 p.m.).",
  "I'm not sure what to do; perhaps you have some ideas?",
  "\"Come quickly,\" she texted, \"there's something you need to see!\"",
  "The instructions say: 'Do not open until Christmas.'",
  "I've heard that song before—it's one of my favorites!",
  "There are several reasons: time, money, and logistics.",
  "Wait! Don't touch that—it's hot!",
  "The conference will be held in Paris, France; Rome, Italy; and Madrid, Spain.",
  "Would you prefer tea, coffee, or hot chocolate?",
  "\"I can't believe you did that!\" she exclaimed.",
  "The forecast predicts rain (70% chance) for tomorrow's picnic.",
  "The package—delivered yesterday—contained all the supplies we ordered.",
  "Have you tried the new restaurant downtown? It's amazing!",
  "Please reply with 'yes,' 'no,' or 'maybe' by tomorrow."
];

const numberWords = [
  "42 is the answer to everything",
  "There are 365 days in a year",
  "The temperature is 25°C outside",
  "I have 99 problems but typing isn't one",
  "It costs $19.99 plus tax",
  "Room 101 is down the hall",
  "Call 555-0123 for more information",
  "The year is 2025 according to the calendar",
  "Chapter 7, page 123 contains the answer",
  "The final score was 3-2",
  "My address is 1234 Oak Street",
  "The sale offers 50% off all items",
  "We need 4 volunteers for the project",
  "The meeting will take 90 minutes",
  "Highway 66 is closed for repairs",
  "The child is 8 years old today",
  "The recipe requires 2 cups of flour",
  "The password must contain at least 1 number",
  "The shop is open from 9:00 to 17:00",
  "The population has increased by 12.5%",
  "The class has 25 students, including 12 boys and 13 girls",
  "I need to buy 3 pounds of apples, 2 pounds of oranges, and 1 pound of grapes",
  "The distance between the two cities is approximately 345.7 miles",
  "Our company has grown by 27% in the last quarter of 2023",
  "The building has 42 floors with 8 apartments on each floor",
  "My new camera cost $599.99 and came with a 2-year warranty",
  "The average adult needs 7-9 hours of sleep per night",
  "The concert tickets are $85 for general admission and $150 for VIP passes",
  "We expect around 300-500 attendees at the conference next week",
  "The recipe will yield 24 cookies at 120 calories each",
  "The property tax rate increased by 0.25% this year",
  "In 2022, the company hired 157 new employees across 6 departments",
  "The museum's collection includes over 10,000 artifacts from the 18th century",
  "Flight AC254 departs at 15:45 from Terminal 3, Gate 27",
  "The laptop weighs 3.2 pounds and measures 13.5 inches diagonally",
  "On average, Americans consume 68 quarts of popcorn per person annually",
  "The Earth is approximately 93,000,000 miles from the Sun",
  "The 2024 budget includes a 5.7% increase for education funding",
  "I need to memorize 50 vocabulary words for tomorrow's test",
  "The marathon record is 2 hours, 1 minute, and 9 seconds"
];

const quotes = [
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The only way to do great work is to love what you do.",
  "Life is what happens when you're busy making other plans.",
  "In three words I can sum up everything I've learned about life: it goes on.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Be yourself; everyone else is already taken.",
  "Whether you think you can or you think you can't, you're right.",
  "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
  "The question isn't who is going to let me; it's who is going to stop me.",
  "The only impossible journey is the one you never begin.",
  "Yesterday is history, tomorrow is a mystery, today is a gift. That's why we call it 'The Present'.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "You miss 100% of the shots you don't take.",
  "It does not matter how slowly you go as long as you do not stop.",
  "The way to get started is to quit talking and begin doing.",
  "Do not wait to strike till the iron is hot; but make it hot by striking.",
  "Success seems to be connected with action. Successful people keep moving.",
  "Life is short, and it is up to you to make it sweet.",
  "Believe you can and you're halfway there.",
  "If you want to lift yourself up, lift up someone else.",
  "The greatest glory in living lies not in never falling, but in rising every time we fall.",
  "Your time is limited, so don't waste it living someone else's life.",
  "If life were predictable it would cease to be life, and be without flavor.",
  "If you look at what you have in life, you'll always have more. If you look at what you don't have in life, you'll never have enough.",
  "If you set your goals ridiculously high and it's a failure, you will fail above everyone else's success.",
  "Spread love everywhere you go. Let no one ever come to you without leaving happier.",
  "When you reach the end of your rope, tie a knot in it and hang on.",
  "Always remember that you are absolutely unique. Just like everyone else.",
  "Don't judge each day by the harvest you reap but by the seeds that you plant.",
  "Tell me and I forget. Teach me and I remember. Involve me and I learn.",
  "The best and most beautiful things in the world cannot be seen or even touched — they must be felt with the heart.",
  "It is during our darkest moments that we must focus to see the light.",
  "Whoever is happy will make others happy too.",
  "Do not go where the path may lead, go instead where there is no path and leave a trail.",
  "You will face many defeats in life, but never let yourself be defeated.",
  "In the end, it's not the years in your life that count. It's the life in your years.",
  "Never let the fear of striking out keep you from playing the game.",
  "Life is either a daring adventure or nothing at all.",
  "Many of life's failures are people who did not realize how close they were to success when they gave up.",
  "The purpose of our lives is to be happy."
];

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function generateWords(count: number, mode: TestMode, customText?: string): string {
  let words: string[] = [];
  
  // Always generate at least 5000 words or 10x the requested count, whichever is larger
  const minWordCount = Math.max(5000, count * 10);
  
  switch (mode) {
    case 'punctuation':
      // Generate a much larger set of punctuation sentences
      words = shuffleArray(punctuationWords);
      // Repeat the dataset multiple times to ensure we have plenty of content
      while (words.join(' ').split(' ').length < minWordCount) {
        words = [...words, ...shuffleArray(punctuationWords)];
      }
      return words.join(' ');
      
    case 'numbers':
      // Generate a much larger set of number sentences
      words = shuffleArray(numberWords);
      // Repeat the dataset multiple times to ensure we have plenty of content
      while (words.join(' ').split(' ').length < minWordCount) {
        words = [...words, ...shuffleArray(numberWords)];
      }
      return words.join(' ');
      
    case 'quote':
      // For quote mode, combine multiple random quotes to make it longer
      const quotesToUse = Math.min(20, quotes.length);
      const selectedQuotes = shuffleArray(quotes).slice(0, quotesToUse);
      let quoteText = selectedQuotes.join(' ');
      // Repeat quotes if needed to ensure enough content
      while (quoteText.split(' ').length < minWordCount) {
        quoteText += ' ' + shuffleArray(quotes).join(' ');
      }
      return quoteText;
      
    case 'custom':
      // Use provided custom text or default
      const baseText = customText || "The quick brown fox jumps over the lazy dog. All good men must come to the aid of their country.";
      // Repeat the custom text to ensure we have enough content
      return baseText.repeat(Math.max(1, Math.ceil(minWordCount / baseText.split(' ').length)));
      
    case 'zen':
      // Zen mode - endless typing with a very large set of random common words
      let zenWords: string[] = [];
      // Generate a very large dataset for zen mode
      while (zenWords.length < minWordCount * 2) {  // Double the minimum for zen mode
        zenWords = [...zenWords, ...shuffleArray(commonWords)];
      }
      return zenWords.join(' ');
      
    default:
      // Time and Words modes - generate a much larger set than requested
      words = shuffleArray(commonWords);
      while (words.length < minWordCount) {
        words = [...words, ...shuffleArray(commonWords)];
      }
      return words.join(' ');
  }
}

export function calculateWPM(correctChars: number, elapsedTimeInSeconds: number): number {
  const words = correctChars / 5; // Standard: 5 characters = 1 word
  const minutes = elapsedTimeInSeconds / 60;
  return minutes > 0 ? Math.round(words / minutes) : 0;
}

export function calculateAccuracy(correctChars: number, totalChars: number): number {
  return totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
}

export function calculateConsistency(wpmHistory: number[]): number {
  if (wpmHistory.length < 2) return 100;
  
  // Remove outliers for better consistency calculation
  const sortedWpm = [...wpmHistory].sort((a, b) => a - b);
  const q1 = sortedWpm[Math.floor(sortedWpm.length * 0.25)];
  const q3 = sortedWpm[Math.floor(sortedWpm.length * 0.75)];
  const iqr = q3 - q1;
  const filteredWpm = sortedWpm.filter(wpm => wpm >= q1 - 1.5 * iqr && wpm <= q3 + 1.5 * iqr);
  
  // If we've filtered too many points, just use the original data
  const dataToUse = filteredWpm.length > wpmHistory.length / 2 ? filteredWpm : wpmHistory;
  
  const average = dataToUse.reduce((a, b) => a + b, 0) / dataToUse.length;
  const variance = dataToUse.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / dataToUse.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Higher consistency = lower standard deviation relative to average
  // Adjust the formula to make results more intuitive
  const consistency = Math.max(0, 100 - Math.min(100, (standardDeviation / (average || 1) * 100)));
  return Math.round(consistency);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}