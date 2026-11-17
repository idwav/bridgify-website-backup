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
  "plan": "מתג \"לפני / אחרי\" במקום מחוון הגרירה, בגודל אמיתי. \"לפני\": חמשת פידי הספקים כגלילה הצידה, קוד ב־12px. \"אחרי\": אובייקט Bridgify אחד ב־12px וכרטיס ההזמנה שנוצר ממנו. בטאבלט נשאר המחוון.",
  "shot": "demos/api-01.jpg",
  "scale": 0.82,
  "minfs": 6.3,
  "small": 0.98,
  "past": 0,
  "screen": 0.6,
  "scroller": false,
  "after": [
   "after/nz-before.jpg",
   "after/nz-after.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "api",
  "name": "What’s inside · חיפוש בקטלוג",
  "type": "רשימות + תמונות",
  "patterns": [
   "trim"
  ],
  "plan": "חמש הקטגוריות הופכות לשורת צ׳יפים אחת שנגללת הצידה (כולן נשארות, אף שם לא נחתך), ובתוצאות 2 חוויות במקום 3. שורת ה־GET יורדת שורה במקום להיחתך. הבלוק ירד מ־113% מגובה המסך לכשני שלישים.",
  "shot": "demos/api-02.jpg",
  "scale": 1,
  "minfs": 11,
  "small": 0.06,
  "past": 0,
  "screen": 1.13,
  "scroller": false,
  "after": [
   "after/ex-after.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "api",
  "name": "הטלפון של חברת התעופה",
  "type": "מוקאפ טלפון",
  "patterns": [
   "bleed",
   "trim"
  ],
  "plan": "הטלפון בגודל אמיתי (במקום 68%), חתוך בתחתית הבמה, עם פס ה־API מעל החיתוך. שלבי הסיפור (גילוי, בחירת שעה, תשלום) ממשיכים להתחלף, וכל הטקסט בטלפון קריא.",
  "shot": "demos/api-03.jpg",
  "scale": 0.68,
  "minfs": 9,
  "small": 0.78,
  "past": 0,
  "screen": 0.51,
  "scroller": false,
  "after": [
   "after/cj-after-0.jpg",
   "after/cj-after-1.jpg",
   "after/cj-after-2.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "marketplace",
  "name": "חנות ההדגמה בהירו",
  "type": "ממשק",
  "patterns": [
   "trim"
  ],
  "plan": "שתי חוויות מומלצות במקום שלוש, רחבות יותר, והתוויות ב־11px. שאר החנות נשארה כמו שהיא.",
  "shot": "demos/marketplace-00.jpg",
  "scale": 1,
  "minfs": 10,
  "small": 0.22,
  "past": 0,
  "screen": 0.72,
  "scroller": false,
  "after": [
   "after/mk-after-hero.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "marketplace",
  "name": "סיור: גילוי → צ׳ק־אאוט",
  "type": "ממשק דסקטופ",
  "patterns": [
   "phone",
   "steps"
  ],
  "plan": "בלי הקטנה: בגודל אמיתי הסיור מסתדר לבד לרוחב הטלפון (540px, נכנס במסך). כל ארבעת השלבים נשארים עם הטאבים.",
  "shot": "demos/marketplace-02.jpg",
  "scale": 0.78,
  "minfs": 9,
  "small": 0.85,
  "past": 0,
  "screen": 0.63,
  "scroller": false,
  "after": [
   "after/mk-after-tour.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "marketplace",
  "name": "תצוגת לוקליזציה",
  "type": "ממשק דסקטופ",
  "patterns": [
   "phone"
  ],
  "plan": "בלי הקטנה: התצוגה בגודל אמיתי (420px), והמחיר €39.00 מודגש ב־28px כמספר מרכזי.",
  "shot": "demos/marketplace-04.jpg",
  "scale": 0.78,
  "minfs": 9,
  "small": 0.56,
  "past": 0,
  "screen": 0.5,
  "scroller": false,
  "after": [
   "after/mk-after-loc.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "marketplace",
  "name": "ציר ההשקה ב־3 ימים",
  "type": "ציר + ממשק",
  "patterns": [
   "rise",
   "trim"
  ],
  "plan": "שלושת הימים כטקסט על קו עם נקודות, בלי קופסאות. החנות בגודל אמיתי (במקום 42%), עם תמונת כיסוי נמוכה יותר וחוויה מומלצת אחת.",
  "shot": "demos/marketplace-08.jpg",
  "scale": 0.42,
  "minfs": 9,
  "small": 0.42,
  "past": 0,
  "screen": 1.31,
  "scroller": false,
  "after": [
   "after/mk-after-launch.jpg",
   "after/mk-st2-store.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "personalization",
  "name": "כרטיס הכוונה (Intent)",
  "type": "ממשק",
  "patterns": [
   "trim"
  ],
  "plan": "כמו בדף הבית: התוויות 11px, הערכים שזוהו (Romantic, Paris) ב־17px, ושורת ה־Context ב־13px.",
  "shot": "demos/personalization-01.jpg",
  "scale": 1,
  "minfs": 9,
  "small": 0.45,
  "past": 0,
  "screen": 0.29,
  "scroller": false,
  "after": [
   "after/ai-after-intent.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "personalization",
  "name": "חפיסת ההתאמות",
  "type": "כרטיסים עם תמונות",
  "patterns": [
   "deck"
  ],
  "plan": "חפיסה: כרטיס אחד בכל פעם, ברוחב מלא ובגודל אמיתי. הכרטיסים שמאחוריו מופיעים רק כשולי החפיסה מתחתיו, במקום מניפה של כרטיסים זעירים שבורחת מהמסך. הכרטיס הראשי ממשיך להתחלף לבד.",
  "shot": "demos/personalization-04.jpg",
  "scale": 1,
  "minfs": 8.4,
  "small": 0.55,
  "past": 74,
  "screen": 0.34,
  "scroller": false,
  "after": [
   "after/ai-after-deck.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "personalization",
  "name": "בלי AIyelet / עם AIyelet",
  "type": "השוואת ממשק",
  "patterns": [
   "steps",
   "trim"
  ],
  "plan": "המתג \"בלי / עם AIyelet\" נשאר. הדפדפן בגודל אמיתי (במקום מוקטן), עם תמונות נמוכות יותר כדי שייכנס. כל הטקסט קריא, 11px ומעלה.",
  "shot": "demos/personalization-05.jpg",
  "scale": 1,
  "minfs": 9,
  "small": 0.8,
  "past": 0,
  "screen": 0.77,
  "scroller": false,
  "after": [
   "after/ai-after-embed.jpg",
   "after/ai-after-embed2.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "otas",
  "name": "כרטיס ההירו: הימים שבאמצע",
  "type": "ממשק",
  "patterns": [
   "trim",
   "rise"
  ],
  "plan": "הכרטיס בגודל אמיתי (במקום 75%), התמונות של \"הימים שבאמצע\" נמוכות יותר. כל הטקסט 11px ומעלה, ושום דבר לא בורח מהמסך.",
  "shot": "demos/otas-00.jpg",
  "scale": 0.75,
  "minfs": 6,
  "small": 0.69,
  "past": 394,
  "screen": 0.83,
  "scroller": false,
  "after": [
   "after/z2-otas-0.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "otas",
  "name": "מקורות → אינטגרציה אחת",
  "type": "דיאגרמה + תמונות",
  "patterns": [
   "figure",
   "trim"
  ],
  "plan": "הדיאגרמה בגודל אמיתי (במקום 74%): שלושת סוגי המקורות ← Bridgify ← 3 תמונות במקום 6.",
  "shot": "demos/otas-01.jpg",
  "scale": 0.74,
  "minfs": 9,
  "small": 0.89,
  "past": 0,
  "screen": 0.85,
  "scroller": false,
  "after": [
   "after/z2-otas-1.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "otas",
  "name": "המלצות לאורך הטיול",
  "type": "גלילה אופקית",
  "patterns": [
   "peek",
   "trim"
  ],
  "plan": "הגלילה הצידה נשארת; הטקסט בתוך הכרטיסים הועלה ל־11px לפחות.",
  "shot": "demos/otas-02.jpg",
  "scale": 1,
  "minfs": 9,
  "small": 0.16,
  "past": 1611,
  "screen": 0.96,
  "scroller": true,
  "after": [
   "after/otas-rc-rc.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "otas",
  "name": "כרטיס \"Experiences API\" (משותף ל־6 דפים)",
  "type": "קוד + מוקאפ",
  "patterns": [
   "trim",
   "open"
  ],
  "plan": "רכיב משותף לששת עמודי הפתרונות, תוקן פעם אחת: במקום מיניאטורות ב־5.8–8.5px, כל כרטיס מראה את העיקר בגודל אמיתי, אחד מתחת לשני. Experiences API: ארבע שורות קוד ב־12.5px והתוצאה באפליקציה. White-Label: החנות עם שתי חוויות.",
  "shot": "demos/otas-04.jpg",
  "scale": 1,
  "minfs": 5.8,
  "small": 0.63,
  "past": 0,
  "screen": 0.58,
  "scroller": false,
  "after": [
   "after/otas-xc-api.jpg",
   "after/otas-xc-wl.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "airlines",
  "name": "הטלפון: אישור הזמנה",
  "type": "מוקאפ טלפון",
  "patterns": [
   "bleed",
   "trim"
  ],
  "plan": "הטלפון בגודל אמיתי (במקום 68%), כל הטקסט קריא ו־11px ומעלה.",
  "shot": "demos/airlines-07.jpg",
  "scale": 0.68,
  "minfs": 9,
  "small": 0.87,
  "past": 0,
  "screen": 0.63,
  "scroller": false,
  "after": [
   "after/z2-airlines-0.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "hotels",
  "name": "מפת החוויות של המלון",
  "type": "מפה + רשימה",
  "patterns": [
   "bleed",
   "trim"
  ],
  "plan": "המפה בגודל אמיתי (במקום 67%), עם הטאבים והנקודות קריאים.",
  "shot": "demos/hotels-01.jpg",
  "scale": 0.67,
  "minfs": 8.1,
  "small": 0.74,
  "past": 0,
  "screen": 0.57,
  "scroller": false,
  "after": [
   "after/z2-hotels-0.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "hotels",
  "name": "המייל לאורח",
  "type": "מוקאפ מייל",
  "patterns": [
   "phone",
   "trim"
  ],
  "plan": "המייל בגודל אמיתי (במקום 67%), עם תמונה נמוכה יותר; \"IN PARIS\" עלה ל־11px.",
  "shot": "demos/hotels-04.jpg",
  "scale": 0.67,
  "minfs": 5.3,
  "small": 0.52,
  "past": 0,
  "screen": 0.66,
  "scroller": false,
  "after": [
   "after/z2-hotels-1.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "loyalty-finance",
  "name": "אתר ההטבות (84,000 נק׳)",
  "type": "ממשק",
  "patterns": [
   "trim"
  ],
  "plan": "אתר ההטבות בגודל אמיתי (במקום 81%).",
  "shot": "demos/loyalty-finance-00.jpg",
  "scale": 0.81,
  "minfs": 9.7,
  "small": 0.46,
  "past": 0,
  "screen": 0.64,
  "scroller": false,
  "after": [
   "after/z2-loyalty-finance-0.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "loyalty-finance",
  "name": "הטבות כרטיס האשראי",
  "type": "ממשק",
  "patterns": [
   "phone",
   "trim"
  ],
  "plan": "הטבות הכרטיס בגודל אמיתי (במקום 64%).",
  "shot": "demos/loyalty-finance-03.jpg",
  "scale": 0.64,
  "minfs": 9,
  "small": 0.77,
  "past": 0,
  "screen": 0.57,
  "scroller": false,
  "after": [
   "after/z2-loyalty-finance-1.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "travel-technology",
  "name": "קוד JSON בהירו",
  "type": "קוד",
  "patterns": [
   "trim"
  ],
  "plan": "הקוד בגודל אמיתי (במקום 57%) ב־12px, בלי סרגל האייקונים בצד, והחלון בגובה התוכן.",
  "shot": "demos/travel-technology-00.jpg",
  "scale": 0.57,
  "minfs": 9,
  "small": 1,
  "past": 24,
  "screen": 0.69,
  "scroller": false,
  "after": [
   "after/z2-travel-technology-0.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "travel-technology",
  "name": "לבד מול עם Bridgify",
  "type": "השוואה + תמונות",
  "patterns": [
   "steps",
   "trim"
  ],
  "plan": "שתי האפשרויות אחת מתחת לשנייה ברוחב מלא (היו שתי עמודות צרות). תוקן באג: הדיאגרמה הייתה ברוחב 0 בטלפון, והתגיות (XML, JSON...) ברחו מהמסך ונחתכו.",
  "shot": "demos/travel-technology-01.jpg",
  "scale": 1,
  "minfs": 8,
  "small": 0.14,
  "past": 0,
  "screen": 1.2,
  "scroller": false,
  "after": [
   "after/travel-technology-ti-a.jpg",
   "after/travel-technology-ti-b.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "super-apps",
  "name": "אפליקציית ה־Super App בהירו",
  "type": "מוקאפ טלפון",
  "patterns": [
   "bleed",
   "trim"
  ],
  "plan": "אפליקציית ה־Super App בגודל אמיתי (במקום 80%); ב־iPhone SE מוקטנת ל־85% כדי להיכנס לעמודה.",
  "shot": "demos/super-apps-00.jpg",
  "scale": 0.8,
  "minfs": 9,
  "small": 0.84,
  "past": 0,
  "screen": 0.66,
  "scroller": false,
  "after": [
   "after/z2-super-apps-0.jpg"
  ],
  "status": "נבנה במעבדה"
 },
 {
  "page": "super-apps",
  "name": "הסיפור: נסיעה לליסבון",
  "type": "מוקאפ + שלבים",
  "patterns": [
   "rise"
  ],
  "plan": "הטלפון של הסיפור בגודל אמיתי (במקום 74%).",
  "shot": "demos/super-apps-04.jpg",
  "scale": 0.74,
  "minfs": 10.4,
  "small": 0.65,
  "past": 0,
  "screen": 0.6,
  "scroller": false,
  "after": [
   "after/z2-super-apps-1.jpg"
  ],
  "status": "נבנה במעבדה"
 }
];
