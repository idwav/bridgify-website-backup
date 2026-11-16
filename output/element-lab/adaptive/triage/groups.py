import json
# group: keep | fix | variant | static | simplify
G = {
 # API
 'api-01.jpg': ('keep', 'קוד וכרטיס תוצאה נקראים. שומרים.'),
 'api-03.jpg': ('variant', 'שני גושי JSON עם קו שמחבר ביניהם; טקסט 7.8px. במובייל: לפני ← אחרי כשתי שורות מתחלפות, בלי הקו.'),
 'api-05.jpg': ('fix', 'שורת הטאבים נחתכת ("Attractions and"). לשבור לשתי שורות במקום לגלול.'),
 'api-07.jpg': ('variant', 'טלפון ב־68%. במובייל: הטלפון בגודל מלא, מצב אחד בכל פעם לפי השלב שנבחר למטה.'),
 'api-08.jpg': ('keep', 'ארבעה שלבים ברשת 2×2. עובד.'),
 'api-10.jpg': ('keep', 'מתג You build / Bridgify manages. עובד.'),
 'api-11.jpg': ('keep', 'פאנל המוצר בגודל מלא. עובד.'),
 'api-12.jpg': ('keep', 'שני כפתורים. עובד.'),
 'api-14.jpg': ('keep', 'אקורדיון. עובד.'),
 # Marketplace
 'marketplace-01.jpg': ('variant', 'חנות ופאנל הגדרות זה על זה, ב־72%; טקסט 6.5px. במובייל: החנות לבד בגודל מלא, והגדרות המותג כשורת צבעים מתחת.'),
 'marketplace-03.jpg': ('variant', 'מסך החנות ב־78%; טקסט 7.8px. במובייל: המסך ברוחב מלא בלי מסגרת הדפדפן, ארבעת השלבים נשארים טאבים.'),
 'marketplace-05.jpg': ('fix', 'שורת האפשרויות נחתכת ("Inside your app"). לשבור לשורה שנייה במקום לגלול. התצוגה ב־77% → בגודל מלא.'),
 'marketplace-07.jpg': ('keep', 'You bring / Bridgify runs. עובד.'),
 'marketplace-09.jpg': ('fix', 'שלושה ימים ברצף בגלילה הצידה — רצף לא צריך גלילה. רשימה אנכית של 3 ימים. החנות למטה ב־43% → מצב סופי סטטי בגודל מלא או מוסתרת.'),
 'marketplace-11.jpg': ('keep', 'מתג Build / Buy. עובד.'),
 'marketplace-12.jpg': ('keep', 'כרטיס אחד בכל פעם. עובד.'),
 'marketplace-14.jpg': ('keep', 'רשת 2×2. עובד.'),
 # AIyelet
 'personalization-00.jpg': ('variant', 'ה־Hero: ממתין להחלטה שלך על ה־Hero במובייל.'),
 'personalization-02.jpg': ('keep', 'משפט ההקלדה והשדות. עובד.'),
 'personalization-04.jpg': ('fix', 'הכרטיס השני מציץ חתוך ("wer by night"). כרטיס אחד ברוחב מלא, עם ← → שכבר קיימים.'),
 'personalization-06.jpg': ('variant', 'כל הדפדפן ב־46%; טקסט 5.5px — הכי קטן באתר. במובייל: שני מצבים (Without / With) כשני מסכים פשוטים, אחד בכל פעם.'),
 'personalization-07.jpg': ('keep', 'שני כפתורים. עובד.'),
 'personalization-09.jpg': ('fix', 'בוקר → צהריים → ערב זה רצף, לא קרוסלה. רשימה אנכית של שלוש התחנות.'),
 'personalization-10.jpg': ('keep', 'כפתורי הדמו הקיימים באתר.'),
 # OTAs
 'otas-01.jpg': ('static', 'הכרטיס ב־75%; טקסט 6px. אין בו אינטראקציה — מצב סופי בגודל מלא, הוא פשוט יהיה גבוה יותר.'),
 'otas-04.jpg': ('fix', 'ארבעת הרגעים מופיעים פעמיים: כציר למעלה וכקרוסלה עם כרטיס חתוך. הציר הופך לטאבים, ומוצג כרטיס אחד מלא.'),
 'otas-06.jpg': ('fix', 'Choose how: שני כרטיסים בגלילה, השני חתוך. מתג API / Marketplace כמו ב־Build or Buy.'),
 # Airlines
 'airlines-01.jpg': ('fix', 'שלושה שלבים ממוספרים (01 02 03) בגלילה הצידה, השני חתוך. רצף → רשימה אנכית קומפקטית.'),
 'airlines-03.jpg': ('fix', 'שני חלקים בגלילה (הכרטיס והתמונות), השני חתוך. נערמים אחד מתחת לשני, התמונות כשורה של 3.'),
 'airlines-05.jpg': ('variant', 'מסך האישור ב־68%; טקסט 6.1px. במובייל: מסך אחד בגודל מלא לכל נקודת מגע, הצ׳יפים מעליו בוחרים.'),
 'airlines-07.jpg': ('fix', 'Choose how: מתג API / Marketplace.'),
 # Hotels
 'hotels-01.jpg': ('simplify', 'מפה עם 16 כפתורים ב־69%; טקסט 6.2px. גם בדסקטופ זה הרבה. הצעה: מפה סטטית עם 3–4 נקודות, והפילטרים כשורת צ׳יפים מעל.'),
 'hotels-03.jpg': ('keep', 'רשימה ותמונה. עובד.'),
 'hotels-04.jpg': ('keep', 'טקסט מקופל. עובד.'),
 'hotels-06.jpg': ('static', 'המייל ב־67%; טקסט 5.3px. מצב סופי בגודל מלא, בלי מסגרת תיבת הדואר.'),
 'hotels-08.jpg': ('fix', 'Choose how: מתג API / Marketplace.'),
 'hotels-09.jpg': ('keep', 'פסקה. עובד.'),
 # Loyalty
 'loyalty-finance-01.jpg': ('fix', 'ב־80%; טקסט 9.6px. בלי כיווץ — ייצא קצת יותר גבוה, וזה בסדר.'),
 'loyalty-finance-03.jpg': ('fix', 'כרטיס הנקודות ותמונה בגלילה הצידה. נערמים: הנקודות, ואז החוויה.'),
 'loyalty-finance-04.jpg': ('keep', 'שורת תוצאה. עובד.'),
 'loyalty-finance-06.jpg': ('variant', 'שלושה use cases עם פאנל ב־64%; טקסט 7.7px. במובייל: הטאבים בוחרים, והפאנל של כל אחד בגודל מלא ופשוט יותר.'),
 'loyalty-finance-08.jpg': ('fix', 'Choose how: מתג API / Marketplace.'),
 'loyalty-finance-09.jpg': ('keep', 'פסקה. עובד.'),
 'loyalty-finance-11.jpg': ('keep', 'רשימה של 5. עובד.'),
 'loyalty-finance-13.jpg': ('keep', 'שלושה מקורות וכרטיס. עובד.'),
 'loyalty-finance-14.jpg': ('keep', 'פסקה. עובד.'),
 # Travel tech
 'travel-technology-02.jpg': ('static', 'קוד → Bridgify → חנות, ב־57%; טקסט 7.5px. מצב סופי: שלושה שלבים אנכיים, כל אחד בגודל מלא.'),
 'travel-technology-04.jpg': ('keep', 'פתיח מקופל וכפתורים. עובד.'),
 'travel-technology-05.jpg': ('simplify', 'קופסה כהה ענקית עם אייקונים קטנים באמצע — המפה לא עובדת במובייל, והאנימציה נשברת בכיווץ. הצעה: שני טורים (לבד / עם Bridgify) כרשימות, ו־"12 integrations" כמספר. כדאי לשקול לפשט גם בדסקטופ.'),
 'travel-technology-07.jpg': ('fix', 'שלושה סוגי מוצרים בגלילה, השני חתוך. טאבים לפי השם, כרטיס אחד מלא.'),
 'travel-technology-08.jpg': ('keep', 'שורת רשת. עובד.'),
 'travel-technology-09.jpg': ('keep', 'פסקה וכפתורים. עובד.'),
 'travel-technology-11.jpg': ('keep', 'כרטיס יחיד. עובד.'),
 # Super apps
 'super-apps-01.jpg': ('fix', 'הטלפון ב־80%; טקסט 8.8px. בלי כיווץ — ייצא קצת יותר גבוה.'),
 'super-apps-03.jpg': ('keep', 'שני פריטים. עובד.'),
 'super-apps-05.jpg': ('keep', 'פסקה וכפתור. עובד.'),
 'super-apps-07.jpg': ('fix', 'Choose how: מתג API / Marketplace.'),
}
d = json.load(open('triage.json'))
NAMES = {'api': 'Experiences API', 'marketplace': 'White-Label Marketplace', 'personalization': 'AIyelet', 'otas': 'OTAs', 'airlines': 'Airlines', 'hotels': 'Hotels', 'loyalty-finance': 'Loyalty & finance', 'travel-technology': 'Travel technology', 'super-apps': 'Super apps'}
rows = []
for pg, bl in d.items():
    for b in bl:
        s = b.get('shot')
        if not s: continue
        g, why = G.get(s, ('keep', ''))
        if s not in G: print('unsorted', s)
        rows.append({'page': NAMES[pg], 'file': pg, 'section': b['section'], 'label': b['label'], 'shot': s, 'group': g, 'why': why,
                     'scale': b['scale'], 'minEff': b['minEff'], 'small12': b['small12'], 'screens': b['screens'],
                     'scroller': b.get('scroller'), 'controls': b['controls'], 'animated': b['animated']})
json.dump(rows, open('groups.json', 'w'), ensure_ascii=False, indent=1)
open('groups.js', 'w').write('window.TRIAGE=' + json.dumps(rows, ensure_ascii=False) + ';')
from collections import Counter; print(Counter(r['group'] for r in rows))
