const SUPABASE_URL = 'https://kazyasykjhmrjmiuheez.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthenlhc3lramhtcmptaXVoZWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzIwMzQsImV4cCI6MjA5MjAwODAzNH0.WcFsFmHaQZswRLT1uw2g1RGRxI3vFYFCcFHXiTUctpY';
const sb = supabase.createClient('https://kazyasykjhmrjmiuheez.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthenlhc3lramhtcmptaXVoZWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzIwMzQsImV4cCI6MjA5MjAwODAzNH0.WcFsFmHaQZswRLT1uw2g1RGRxI3vFYFCcFHXiTUctpY');
const texts = ['Hello', 'Good morning', 'Thank you', 'Practice every day'];
let current = 'Hello';

function qs(x) {
    return document.getElementById(x)
}

function show(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    qs(id).classList.add('active')
}
async function register() {
    const email = qs('email').value,
        password = qs('password').value;
    const {
        data,
        error
    } = await sb.auth.signUp({
        email,
        password
    });
    if (error) return alert(error.message);
    const user = data.user;
    await sb.from('profiles').insert({
        id: user.id,
        full_name: qs('name').value,
        section: qs('section').value
    });
    alert('Registered. Check email if confirmation enabled.');
}
async function login() {
    const {
        error
    } = await sb.auth.signInWithPassword({
        email: qs('email').value,
        password: qs('password').value
    });
    if (error) return alert(error.message);
    show('home');
    loadStats();
    loadLeaders();
}
async function logout() {
    await sb.auth.signOut();
    show('auth');
}

function nextText() {
    current = texts[Math.floor(Math.random() * texts.length)];
    qs('target').innerText = current;
}

function speak() {
    speechSynthesis.speak(new SpeechSynthesisUtterance(current));
}

function recognize() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert('Unsupported');
    const r = new SR();
    r.lang = 'en-US';
    r.start();
    r.onresult = async e => {
        const said = e.results[0][0].transcript;
        const score = similarity(said, current);
        qs('result').innerText = `You said: ${said} | Score ${score}%`;
        await saveScore(score);
        loadStats();
        loadLeaders();
    };
}

function similarity(a, b) {
    a = a.toLowerCase().trim();
    b = b.toLowerCase().trim();
    return a === b ? 100 : Math.max(40, Math.floor((Math.min(a.length, b.length) / Math.max(a.length, b.length)) * 100));
}
async function saveScore(score) {
    const {
        data: {
            user
        }
    } = await sb.auth.getUser();
    const {
        data: row
    } = await sb.from('scores').select('*').eq('user_id', user.id).maybeSingle();
    const practice = (row?.practice_count || 0) + 1;
    const total = (row?.total_score || 0) + score;
    await sb.from('scores').upsert({
        user_id: user.id,
        practice_count: practice,
        total_score: total,
        updated_at: new Date().toISOString()
    });
}
async function loadStats() {
    const {
        data: {
            user
        }
    } = await sb.auth.getUser();
    const {
        data
    } = await sb.from('scores').select('*').eq('user_id', user.id).maybeSingle();
    const p = data?.practice_count || 0,
        t = data?.total_score || 0;
    const avg = p ? Math.floor(t / p) : 0;
    qs('stats').innerText = `Practices: ${p} | Average: ${avg}%`;
}
async function loadLeaders() {
        const {
            data
        } = await sb.from('profiles').select('full_name,section,scores(practice_count,total_score)').limit(50);
        const rows = (data || []).map(x => {
            const s = x.scores?.[0] || x.scores || {};
            const p = s.practice_count || 0;
            const avg = p ? Math.floor((s.total_score || 0) / p) : 0;
            return {
                ...x,
                p,
                avg
            };
        }).sort((a, b) => b.avg - a.avg);
        qs('leaders').innerHTML = rows.map((r, i) => `<div class='row'><span>#${i+1} ${r.full_name}</span><span>${r.avg}%</span></div>`).join('');
    }
    (async () => {
      const {

        data: {

          session
        }
        } = await sb.auth.getSession();
        if (session) {
            show('home');
            loadStats();
            loadLeaders();
        }
    })();