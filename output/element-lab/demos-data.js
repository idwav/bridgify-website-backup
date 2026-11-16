window.DEMOS = [
 {
  "page": "index-v2",
  "name": "כרטיס הכוונה (Intent)",
  "type": "ממשק",
  "patterns": [
   "trim"
  ],
  "plan": "שלושת השדות (Intent · Destination · Context) בגודל 13px לפחות במקום 9px. כיתוב ה־Context נשאר תווית קטנה ושקטה.",
  "shot": "demos/index-v2-03.jpg",
  "scale": 1,
  "minfs": 9,
  "small": 0.45,
  "past": 0,
  "screen": 0.27,
  "scroller": false,
  "after": [
   "after/hd-intent.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "index-v2",
  "name": "שלושת המוצרים",
  "type": "ממשק בתוך כרטיסים",
  "patterns": [
   "rise",
   "trim"
  ],
  "plan": "במקום גלילה הצידה: שלושת כרטיסי המוצר נערמים בזמן הגלילה. כל כרטיס נצמד מתחת לכותרת, הבא מחליק מעליו, והמכוסה נסוג (92%, כהה יותר). בכל כרטיס העיקר בגודל אמיתי: 4 שורות קוד ב־12.5px, חנות עם חוויה אחת, ובקשת AIyelet ב־14px. בטאבלט נשארת הגלילה הצידה; עם \"הפחת תנועה\" הכרטיסים נצמדים בלי הנסיגה.",
  "shot": "demos/index-v2-04.jpg",
  "scale": 1,
  "minfs": 6.7,
  "small": 0.38,
  "past": 540,
  "screen": 0.68,
  "scroller": true,
  "after": [
   "after/stack-0.jpg",
   "after/stack-1.jpg",
   "after/stack-2.jpg",
   "after/stack-3.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "index-v2",
  "name": "הדגמת ה־CTA (סוגי לקוחות)",
  "type": "שבבים + תמונות",
  "patterns": [
   "peek"
  ],
  "plan": "שורת השבבים (Passengers · Hotel guests · Cardholders) גולשת 173px. השארתה כגלילה אופקית עם הצצה, וכרטיסי החוויות מ־2 ל־1.",
  "shot": "demos/index-v2-09.jpg",
  "scale": 1,
  "minfs": 12,
  "small": 0,
  "past": 173,
  "screen": 0.47,
  "scroller": false,
  "after": [
   "after/hd-cta.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "index-v2",
  "name": "Why Bridgify · מקורות → מנוע",
  "type": "דיאגרמה",
  "patterns": [
   "figure",
   "trim"
  ],
  "plan": "המקורות כטקסט בלי קופסאות; Bridgify Engine כמלבן דק אחד (לוגו משמאל); המספר עם התמונות לצידו. Normalize: שלושה כרטיסי מקור קטנים שמתאחדים במקום למוצר אחד (לולאה של 9 שניות). Distribute: One feed כמלבן דק. Personalize: כותרת מהודקת. הכלל: טקסט בלי קופסה, קופסה רק איפה שיש תמונה או מסך.",
  "shot": "demos/index-v2-11.jpg",
  "scale": 1,
  "minfs": 3.2,
  "small": 1,
  "past": 0,
  "screen": 0.81,
  "scroller": false,
  "after": [
   "after/why-agg.jpg",
   "after/why-norm.jpg",
   "after/why2-dist.jpg",
   "after/why2-pers.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "api",
  "name": "נרמול: 5 פידים → אובייקט אחד",
  "type": "קוד",
  "patterns": [
   "trim",
   "steps"
  ],
  "plan": "40 שורות קוד ב־6.3px. מראים 2 ספקים במקום 5, כל אחד ב־4 שורות ב־12px, ו־\"לפני / אחרי\" כמתג במקום מחוון גרירה. ב\"אחרי\": אובייקט Bridgify אחד ב־6 שורות.",
  "shot": "demos/api-01.jpg",
  "scale": 0.82,
  "minfs": 6.3,
  "small": 0.98,
  "past": 0,
  "screen": 0.6,
  "scroller": false
 },
 {
  "page": "api",
  "name": "What’s inside · חיפוש בקטלוג",
  "type": "רשימות + תמונות",
  "patterns": [
   "trim"
  ],
  "plan": "הבלוק גבוה מהמסך (113%). הקטגוריות מ־5 ל־3 ותוצאות החיפוש מ־3 ל־2, בגודל הקיים.",
  "shot": "demos/api-02.jpg",
  "scale": 1,
  "minfs": 11,
  "small": 0.06,
  "past": 0,
  "screen": 1.13,
  "scroller": false
 },
 {
  "page": "api",
  "name": "הטלפון של חברת התעופה",
  "type": "מוקאפ טלפון",
  "patterns": [
   "bleed",
   "trim"
  ],
  "plan": "הטלפון מוקטן ל־68% והטקסט 9px. מראים אותו בגודל אמיתי, חתוך בתחתית (רואים את הטיול ואת כרטיס החוויה הראשון). הכרטיס השני יורד, ושורת ה־API נשארת 12px.",
  "shot": "demos/api-03.jpg",
  "scale": 0.68,
  "minfs": 9,
  "small": 0.78,
  "past": 0,
  "screen": 0.51,
  "scroller": false
 },
 {
  "page": "marketplace",
  "name": "חנות ההדגמה בהירו",
  "type": "ממשק",
  "patterns": [
   "trim"
  ],
  "plan": "במצב טוב יחסית (10px). החוויות המומלצות מ־3 ל־2 בגודל אמיתי.",
  "shot": "demos/marketplace-00.jpg",
  "scale": 1,
  "minfs": 10,
  "small": 0.22,
  "past": 0,
  "screen": 0.72,
  "scroller": false
 },
 {
  "page": "marketplace",
  "name": "סיור: גילוי → צ׳ק־אאוט",
  "type": "ממשק דסקטופ",
  "patterns": [
   "phone",
   "steps"
  ],
  "plan": "מסכי דפדפן מוקטנים ל־78%. מסך טלפון אחד בגודל אמיתי לכל שלב (Search · Experience · Reviews · Checkout), עם הטאבים שכבר יש.",
  "shot": "demos/marketplace-02.jpg",
  "scale": 0.78,
  "minfs": 9,
  "small": 0.85,
  "past": 0,
  "screen": 0.63,
  "scroller": false
 },
 {
  "page": "marketplace",
  "name": "תצוגת לוקליזציה",
  "type": "ממשק דסקטופ",
  "patterns": [
   "phone"
  ],
  "plan": "מסך טלפון בגודל אמיתי עם כרטיס חוויה אחד שמחליף שפה ומטבע, במקום חלון דפדפן מוקטן.",
  "shot": "demos/marketplace-04.jpg",
  "scale": 0.78,
  "minfs": 9,
  "small": 0.56,
  "past": 0,
  "screen": 0.5,
  "scroller": false
 },
 {
  "page": "marketplace",
  "name": "ציר ההשקה ב־3 ימים",
  "type": "ציר + ממשק",
  "patterns": [
   "rise",
   "trim"
  ],
  "plan": "הכי בעייתי: הבלוק מוקטן ל־42% ותופס 131% מהמסך. הימים נשארים בגודל אמיתי, ותצוגת החנות נצמדת למסך (sticky) ומתחלפת לפי היום תוך כדי גלילה. אפשרות פשוטה יותר: להוריד את תצוגת החנות בטלפון, כי היא כבר מופיעה בהירו.",
  "shot": "demos/marketplace-08.jpg",
  "scale": 0.42,
  "minfs": 9,
  "small": 0.42,
  "past": 0,
  "screen": 1.31,
  "scroller": false
 },
 {
  "page": "personalization",
  "name": "כרטיס הכוונה (Intent)",
  "type": "ממשק",
  "patterns": [
   "trim"
  ],
  "plan": "כמו בדף הבית: שדות ב־13px לפחות.",
  "shot": "demos/personalization-01.jpg",
  "scale": 1,
  "minfs": 9,
  "small": 0.45,
  "past": 0,
  "screen": 0.29,
  "scroller": false
 },
 {
  "page": "personalization",
  "name": "חפיסת ההתאמות",
  "type": "כרטיסים עם תמונות",
  "patterns": [
   "deck"
  ],
  "plan": "הכרטיסים יוצאים מהמסך והכיתובים 8.4px. כרטיס אחד ברוחב מלא ובגודל אמיתי, והבא מציץ מאחוריו. מחליקים ביד, כמו חפיסה.",
  "shot": "demos/personalization-04.jpg",
  "scale": 1,
  "minfs": 8.4,
  "small": 0.55,
  "past": 74,
  "screen": 0.34,
  "scroller": false
 },
 {
  "page": "personalization",
  "name": "בלי AIyelet / עם AIyelet",
  "type": "השוואת ממשק",
  "patterns": [
   "steps",
   "trim"
  ],
  "plan": "80% מהטקסט קטן. מתג אחד בין \"בלי\" ל\"עם\", בגודל אמיתי, ו־2 תוצאות במקום 4.",
  "shot": "demos/personalization-05.jpg",
  "scale": 1,
  "minfs": 9,
  "small": 0.8,
  "past": 0,
  "screen": 0.77,
  "scroller": false
 },
 {
  "page": "otas",
  "name": "כרטיס ההירו: הימים שבאמצע",
  "type": "ממשק",
  "patterns": [
   "trim",
   "rise"
  ],
  "plan": "מוקטן ל־75%, טקסט 6px, וגולש 394px. שלושה כרטיסים זה מתחת לזה בגודל אמיתי: Already sold ← The days in between (3 תמונות) ← You keep the traveler. הברקוד והשורה התחתונה יורדים.",
  "shot": "demos/otas-00.jpg",
  "scale": 0.75,
  "minfs": 6,
  "small": 0.69,
  "past": 394,
  "screen": 0.83,
  "scroller": false
 },
 {
  "page": "otas",
  "name": "מקורות → אינטגרציה אחת",
  "type": "דיאגרמה + תמונות",
  "patterns": [
   "figure",
   "trim"
  ],
  "plan": "מוקטן ל־74%. \"3 סוגי מקורות → אינטגרציה אחת\" בגדול, ורשת התמונות מ־6 ל־3.",
  "shot": "demos/otas-01.jpg",
  "scale": 0.74,
  "minfs": 9,
  "small": 0.89,
  "past": 0,
  "screen": 0.85,
  "scroller": false
 },
 {
  "page": "otas",
  "name": "המלצות לאורך הטיול",
  "type": "גלילה אופקית",
  "patterns": [
   "peek",
   "trim"
  ],
  "plan": "הגלילה נשארת. בתוך כל כרטיס פריטי הטיול יורדים מ־3 ל־2, כדי שהכרטיס ייכנס בגובה המסך.",
  "shot": "demos/otas-02.jpg",
  "scale": 1,
  "minfs": 9,
  "small": 0.16,
  "past": 1611,
  "screen": 0.96,
  "scroller": true
 },
 {
  "page": "otas",
  "name": "כרטיס \"Experiences API\" (משותף ל־6 דפים)",
  "type": "קוד + מוקאפ",
  "patterns": [
   "trim",
   "open"
  ],
  "plan": "טקסט של 5.8px. שורת קוד אחת ב־13px ושורת תוצאה אחת (תמונה, שם, מחיר) בגודל אמיתי. לחיצה פותחת את ההדגמה המלאה. תיקון אחד מכסה את OTAs, Airlines, Hotels, Loyalty, Travel Tech ו־Super Apps.",
  "shot": "demos/otas-04.jpg",
  "scale": 1,
  "minfs": 5.8,
  "small": 0.63,
  "past": 0,
  "screen": 0.58,
  "scroller": false
 },
 {
  "page": "airlines",
  "name": "הטלפון: אישור הזמנה",
  "type": "מוקאפ טלפון",
  "patterns": [
   "bleed",
   "trim"
  ],
  "plan": "מוקטן ל־68%. הטלפון בגודל אמיתי וחתוך: אישור ההזמנה למעלה וחוויה אחת מתחתיו.",
  "shot": "demos/airlines-07.jpg",
  "scale": 0.68,
  "minfs": 9,
  "small": 0.87,
  "past": 0,
  "screen": 0.63,
  "scroller": false
 },
 {
  "page": "hotels",
  "name": "מפת החוויות של המלון",
  "type": "מפה + רשימה",
  "patterns": [
   "bleed",
   "trim"
  ],
  "plan": "מוקטנת ל־67%. המפה בגודל אמיתי, חתוכה סביב המרכז, עם 2 נקודות מסומנות. הרשימה שמתחתיה יורדת.",
  "shot": "demos/hotels-01.jpg",
  "scale": 0.67,
  "minfs": 8.1,
  "small": 0.74,
  "past": 0,
  "screen": 0.57,
  "scroller": false
 },
 {
  "page": "hotels",
  "name": "המייל לאורח",
  "type": "מוקאפ מייל",
  "patterns": [
   "phone",
   "trim"
  ],
  "plan": "מוקטן ל־67% עם טקסט 5.3px. המייל כמו באפליקציית מייל בטלפון: נושא, תמונה, חוויה אחת וכפתור, בגודל אמיתי.",
  "shot": "demos/hotels-04.jpg",
  "scale": 0.67,
  "minfs": 5.3,
  "small": 0.52,
  "past": 0,
  "screen": 0.66,
  "scroller": false
 },
 {
  "page": "loyalty-finance",
  "name": "אתר ההטבות (84,000 נק׳)",
  "type": "ממשק",
  "patterns": [
   "trim"
  ],
  "plan": "מוקטן ל־81%. יתרת הנקודות והטבה אחת או שתיים בגודל אמיתי.",
  "shot": "demos/loyalty-finance-00.jpg",
  "scale": 0.81,
  "minfs": 9.7,
  "small": 0.46,
  "past": 0,
  "screen": 0.64,
  "scroller": false
 },
 {
  "page": "loyalty-finance",
  "name": "הטבות כרטיס האשראי",
  "type": "ממשק",
  "patterns": [
   "phone",
   "trim"
  ],
  "plan": "מוקטן ל־64%. הכרטיס והטבה אחת בגודל אמיתי. ההטבה השנייה יורדת.",
  "shot": "demos/loyalty-finance-03.jpg",
  "scale": 0.64,
  "minfs": 9,
  "small": 0.77,
  "past": 0,
  "screen": 0.57,
  "scroller": false
 },
 {
  "page": "travel-technology",
  "name": "קוד JSON בהירו",
  "type": "קוד",
  "patterns": [
   "trim"
  ],
  "plan": "18 שורות מוקטנות ל־57%. 6 השורות החשובות ב־12px mono, והאייקונים בצד יורדים.",
  "shot": "demos/travel-technology-00.jpg",
  "scale": 0.57,
  "minfs": 9,
  "small": 1,
  "past": 24,
  "screen": 0.69,
  "scroller": false
 },
 {
  "page": "travel-technology",
  "name": "לבד מול עם Bridgify",
  "type": "השוואה + תמונות",
  "patterns": [
   "steps",
   "trim"
  ],
  "plan": "הבלוק גבוה מהמסך (120%) והטקסט 8px. מתג בין \"לבד\" ל\"עם Bridgify\", ו־3 תמונות במקום 6.",
  "shot": "demos/travel-technology-01.jpg",
  "scale": 1,
  "minfs": 8,
  "small": 0.14,
  "past": 0,
  "screen": 1.2,
  "scroller": false
 },
 {
  "page": "super-apps",
  "name": "אפליקציית ה־Super App בהירו",
  "type": "מוקאפ טלפון",
  "patterns": [
   "bleed",
   "trim"
  ],
  "plan": "מוקטן ל־80%. הטלפון בגודל אמיתי וחתוך בתחתית. שורת אייקוני השירותים יורדת.",
  "shot": "demos/super-apps-00.jpg",
  "scale": 0.8,
  "minfs": 9,
  "small": 0.84,
  "past": 0,
  "screen": 0.66,
  "scroller": false
 },
 {
  "page": "super-apps",
  "name": "הסיפור: נסיעה לליסבון",
  "type": "מוקאפ + שלבים",
  "patterns": [
   "rise"
  ],
  "plan": "מוקטן ל־74%. הטלפון נצמד למסך (sticky) בגודל אמיתי, ושלבי הסיפור עולים מעליו בגלילה, כמו בדסקטופ.",
  "shot": "demos/super-apps-04.jpg",
  "scale": 0.74,
  "minfs": 10.4,
  "small": 0.65,
  "past": 0,
  "screen": 0.6,
  "scroller": false
 }
];
