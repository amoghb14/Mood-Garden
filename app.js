const quotes = [
    "The only way to do great work is to love what you do. – Steve Jobs",
    "It always seems impossible until it’s done. – Nelson Mandela",
    "Happiness is not something ready made. It comes from your own actions. – Dalai Lama",
    "Keep your face always toward the sunshine—and shadows will fall behind you. – Walt Whitman",
    "Believe you can and you're halfway there. – Theodore Roosevelt",
    "Do what you can, with what you have, where you are. – Theodore Roosevelt",
    "Act as if what you do makes a difference. It does. – William James",
    "The future belongs to those who believe in the beauty of their dreams. – Eleanor Roosevelt",
    "Start where you are. Use what you have. Do what you can. – Arthur Ashe",
    "You are never too old to set another goal or to dream a new dream. – C.S. Lewis",
    "With the new day comes new strength and new thoughts. – Eleanor Roosevelt",
    "Happiness depends upon ourselves. – Aristotle",
    "Do not wait to strike till the iron is hot, but make it hot by striking. – William Butler Yeats",
    "What lies behind us and what lies before us are tiny matters compared to what lies within us. – Ralph Waldo Emerson",
    "Don’t count the days, make the days count. – Muhammad Ali",
    "The best way to predict the future is to create it. – Peter Drucker",
    "Fall seven times and stand up eight. – Japanese Proverb",
    "Success is not final, failure is not fatal: It is the courage to continue that counts. – Winston Churchill",
    "Keep going. Everything you need will come to you at the perfect time. – Unknown",
    "Your limitation—it’s only your imagination. – Unknown"
  ];

  

document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8080"; 
  
    document.getElementById("showRegister").addEventListener("click", () => {
      document.getElementById("loginForm").classList.add("hidden");
      document.getElementById("registerForm").classList.remove("hidden");
    });
  
    document.getElementById("showLogin").addEventListener("click", () => {
      document.getElementById("registerForm").classList.add("hidden");
      document.getElementById("loginForm").classList.remove("hidden");
    });
  
    //login
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;
  
      try {
        const res = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
  
        if (data.userId) {
          alert("Login successful!");
          console.log("Logged in user:", data);
          localStorage.setItem("userId", data.userId);
  
          document.getElementById("authOverlay").style.display = "none";
          document.getElementById("appContainer").style.display = "block";
  
          
          resetChart();
          loadMoodsAndDrawChart();

          const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
          alert("Welcome back! Here's your positive thought:\n\n" + randomQuote);      
        } else {
          alert("X " + data.error);
        }
      } catch (err) {
        alert("err.");
      }
    });
  
    //register
    document.getElementById("registerForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("registerEmail").value;
      const password = document.getElementById("registerPassword").value;
  
      try {
        const res = await fetch(`${API_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
  
        if (data.userId) {
          alert("Registration successful! You can log in now.");
          document.getElementById("registerForm").classList.add("hidden");
          document.getElementById("loginForm").classList.remove("hidden");
        } else {
          alert("X" + data.error);
        }
      } catch (err) {
        alert("err");
      }
    });
  



    //dates and mood slider
    const today = new Date().toLocaleDateString();
    document.getElementById("dat").textContent = `Today's Date : ${today}`;
  
    const slider = document.getElementById("slider");
    const sliderValue = document.getElementById("value");
  
    function updateSliderValue() {
      const val = +slider.value;
      sliderValue.textContent = val;
      if (val < 4) sliderValue.style.color = "red";
      else if (val < 8) sliderValue.style.color = "orange";
      else sliderValue.style.color = "forestgreen";
    }
  
    slider.addEventListener("input", updateSliderValue);
    updateSliderValue();
  
    const saveMoodBtn = document.getElementById("save-mood");
    const ctx = document.getElementById("moodChart").getContext("2d");
    let moodChart = null;
  
    function resetChart() {
      if (moodChart instanceof Chart) {
        moodChart.destroy();
        moodChart = null;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
    }
  
    saveMoodBtn.addEventListener("click", async () => {
      const userId = localStorage.getItem("userId");
      const mood = +slider.value;
  
      const res = await fetch(`${API_URL}/moods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, mood }),
      });
  
      const data = await res.json();
  
      if (data.success) {
        console.log("Mood saved:", data);
        loadMoodsAndDrawChart();
      } else {
        alert("X" + data.error);
      }

      if(mood <= 6){
        alert("Having a rough day? Speak to our AI companion and make a journal entry!")
      }

    });
  
    async function loadMoodsAndDrawChart() {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
    
        resetChart();
    
        const res = await fetch(`${API_URL}/moods/${userId}`);
        const data = await res.json();
    
        if (!data.success) return console.error("Error loading moods:", data.error);
    
        const moods = data.moods;
    
        
        if (moods.length === 0) {
            moodChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: ["No moods yet"],
                    datasets: [{
                        label: "Mood",
                        data: [0],
                        backgroundColor: "rgba(0,0,0,0)",
                        borderColor: "rgba(0,0,0,0)",
                    }],
                },
                options: {
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { min: 0, max: 10 },
                    },
                },
            });
            return;
        }
    
        //chart
        const labels = moods.map(e => new Date(e.created_at).toLocaleDateString());
        const scores = moods.map(e => e.mood);
    
        moodChart = new Chart(ctx, {
            type: "line",
            data: { labels, datasets: [{ label: "Mood", data: scores }] },
            options: {
                scales: { y: { min: 0, max: 10 } },
            },
        });
    }
    
    //ai chat
    const chatModal = document.getElementById("chatModal");
    const openChatBtn = document.getElementById("aiBtn");
    const closeChatBtn = document.getElementById("closeChat");
    const sendBtn = document.getElementById("sendBtn");
    const chatInput = document.getElementById("chatInput");
    const chatBox = document.getElementById("chatBox");
    let messages = [];
  
    openChatBtn.addEventListener("click", (e) => {
      e.preventDefault();
      chatModal.style.display = "flex";
    });
  
    closeChatBtn.addEventListener("click", () => {
      chatModal.style.display = "none";
    });
  
    function addMessage(role, content) {
      const msgDiv = document.createElement("div");
      msgDiv.className = `message ${role}`;
      msgDiv.textContent = content;
      chatBox.appendChild(msgDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  
    sendBtn.addEventListener("click", async () => {
      const userText = chatInput.value.trim();
      if (!userText) return;
  
      addMessage("user", userText);
      messages.push({ role: "user", content: userText });
      chatInput.value = "";
  
      try {
        const res = await fetch("https://models.github.ai/inference/chat/completions", {
          method: "POST",
          headers: {
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
            Authorization: "Bearer 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",
            "X-GitHub-Api-Version": "2022-11-28",
          },
          body: JSON.stringify({
            model: "openai/gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are a gentle teen therapist. Be supportive and answer questions as a therapist.",
              },
              { role: "user", content: userText },
            ],
          }),
        });
  
        const ct = res.headers.get("content-type") || "";
        let reply = "No response";
  
        if (ct.includes("application/json")) {
          const data = await res.json();
          reply =
            data.choices?.[0]?.message?.content ||
            data.output?.[0]?.content?.[0]?.text ||
            reply;
        } else {
          const text = await res.text();
          console.warn("Non-JSON response:", text);
          reply = text;
        }
  
        addMessage("assistant", reply);
        messages.push({ role: "assistant", content: reply });
      } catch (err) {
        console.error("API Error:", err);
        addMessage("assistant", "Could not connect to AI.");
      }
    });
  





const journalModal = document.getElementById("journalModal");
const closeJournalBtn = document.getElementById("closeJournalBtn");
const saveJournalEntryBtn = document.getElementById("saveJournalEntryBtn");
const journalEntry = document.getElementById("journalEntry");
const journalList = document.getElementById("journalList");

let journalEntries = [];

//entries 
function renderJournalEntries() {
    journalList.innerHTML = "";
    journalEntries.forEach((e) => {
      const div = document.createElement("div");
      div.innerHTML = `
        <strong>${new Date(e.created_at).toLocaleString()}</strong><br>
        ${e.content}
        <button class="delete-entry" data-id="${e.id}" style="margin-left:10px; color:red;">
          X
        </button>
      `;
      div.style.margin = "15px";
      journalList.appendChild(div);
    });
  
  
    document.querySelectorAll(".delete-entry").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const entryId = btn.getAttribute("data-id");
  
        const res = await fetch(`http://localhost:8080/journal/${entryId}`, {
          method: "DELETE",
        });
        const data = await res.json();
  
        if (data.success) {
          loadJournalEntries(); 
        } else {
          alert("X " + data.error);
        }
      });
    });
  }
  

//database loading
async function loadJournalEntries() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  const res = await fetch(`http://localhost:8080/journal/${userId}`);
  const data = await res.json();

  if (data.success) {
    journalEntries = data.entries;
    renderJournalEntries();
  } else {
    console.error("Error fetching journals:", data.error);
  }
}

//new entry
saveJournalEntryBtn.addEventListener("click", async () => {
  const text = journalEntry.value.trim();
  if (!text) return;

  const userId = localStorage.getItem("userId");
  const res = await fetch("http://localhost:8080/journal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, content: text }),
  });
  const data = await res.json();

  if (data.success) {
    journalEntry.value = "";
    loadJournalEntries();
  } else {
    alert("X" + data.error);
  }
});

//modal
document.querySelector('a[href="#my-journal"]').addEventListener("click", (e) => {
  e.preventDefault();
  journalModal.style.display = "block";
  loadJournalEntries();
});

closeJournalBtn.addEventListener("click", () => {
  journalModal.style.display = "none";
});











//checking progress
async function hibiscus() {
    const userId = localStorage.getItem("userId");
    const res = await fetch(`http://localhost:8080/journal/${userId}`);
    const data = await res.json();
  
    console.log("Journal API raw response:", data.entries.length);
    if (data.entries.length >= 25){
        console.log('hello');
        document.getElementById('hib').style.width = "100%"
        document.getElementById('hib').style.background = "linear-gradient(to right, #a8e063, #56ab2f)"
        document.getElementById('Hibby').className = "plant-card"
    }else{
        const p = data.entries.length / 25
        const e = p * 100
        const prog = (`${e}%`)
        document.getElementById('Hibby').className = "plant-card locked"
        document.getElementById('hib').style.width = prog.toString();
    }

    return data.success ? data.entries.length : 0;
}
  
setInterval(hibiscus, 300)


async function tulip() {
    const userId = localStorage.getItem("userId");
    const res = await fetch(`http://localhost:8080/journal/${userId}`);
    const data = await res.json();
  
    if (data.entries.length >= 50){
        console.log('hello');
        document.getElementById('tul').style.width = "100%"
        document.getElementById('tul').style.background = "linear-gradient(to right, #a8e063, #56ab2f)"
        document.getElementById('tully').className = "plant-card"
    }else{
        const p = data.entries.length / 50
        const e = p * 100
        const prog = (`${e}%`)
        document.getElementById('tully').className = "plant-card locked"
        document.getElementById('tul').style.width = prog.toString();
    }

    return data.success ? data.entries.length : 0;
}
  
setInterval(tulip, 300)

async function marigold() {
    const userId = localStorage.getItem("userId");
    const res = await fetch(`http://localhost:8080/moods/${userId}`);
    const data = await res.json();

    let inst = 0;

    for (let entry of data.moods) {
        if (entry.mood >= 7) {
            inst++;
        }
    }

    console.log("Count of moods >= 7:", inst);

    if (inst >= 20) {
        console.log('Unlocked!');
        document.getElementById('mar').style.width = "100%";
        document.getElementById('mar').style.background = "linear-gradient(to right, #a8e063, #56ab2f)";
        document.getElementById('mari').className = "plant-card";
    } else {
        console.log('Still locked.');
        const p = inst / 20;
        const e = p * 100;
        const prog = `${e}%`;
        document.getElementById('mari').className = "plant-card locked";
        document.getElementById('mar').style.width = prog;
    }
}
  
setInterval(marigold, 300)

async function hyacinth() {
    const userId = localStorage.getItem("userId");
    const res = await fetch(`http://localhost:8080/moods/${userId}`);
    const data = await res.json();

    let inst = 0;

    for (let entry of data.moods) {
        if (entry.mood >= 8) {
            inst++;
        }
    }

    if (inst >= 10) {
        console.log('Unlocked!');
        document.getElementById('hya').style.width = "100%";
        document.getElementById('hya').style.background = "linear-gradient(to right, #a8e063, #56ab2f)";
        document.getElementById('hyac').className = "plant-card";
    } else {
        console.log('Still locked.');
        const p = inst / 10;
        const e = p * 100;
        const prog = `${e}%`;
        document.getElementById('hyac').className = "plant-card locked";
        document.getElementById('hya').style.width = prog;
    }
}
  
setInterval(hyacinth, 300)


async function dahlia() {
    const userId = localStorage.getItem("userId");
    const res = await fetch(`http://localhost:8080/moods/${userId}`);
    const data = await res.json();

    let inst = 0;

    for (let entry of data.moods) {
        if (entry.mood >=10) {
            inst++;
        }
    }

    if (inst >= 5) {
        console.log('Unlocked!');
        document.getElementById('dah').style.width = "100%";
        document.getElementById('dah').style.background = "linear-gradient(to right, #a8e063, #56ab2f)";
        document.getElementById('dahl').className = "plant-card";
    } else {
        console.log('Still locked.');
        const p = inst / 5;
        const e = p * 100;
        const prog = `${e}%`;
        document.getElementById('dahl').className = "plant-card locked";
        document.getElementById('dah').style.width = prog;
    }
}
  
setInterval(dahlia, 300)

async function rose() {
    const userId = localStorage.getItem("userId");
    const res = await fetch(`http://localhost:8080/moods/${userId}`);
    const data = await res.json();

    const re = await fetch(`http://localhost:8080/journal/${userId}`);
    const dat = await re.json();

    let inst = 0;

    for (let entry of data.moods) {
        if (entry.mood >= 8) {
            inst++;
        }
    }

    const progress = dat.entries.length + inst;

    if (inst >= 60) {
        console.log('Unlocked!');
        document.getElementById('ro').style.width = "100%";
        document.getElementById('ro').style.background = "linear-gradient(to right, #a8e063, #56ab2f)";
        document.getElementById('ros').className = "plant-card";
    } else {
        console.log('Still locked.');
        const p = progress / 60;
        const e = p * 100;
        const prog = `${e}%`;
        document.getElementById('ros').className = "plant-card locked";
        document.getElementById('ro').style.width = prog;
    }
}
  
setInterval(rose, 300)









    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
  
        document.querySelectorAll(".garden-grid").forEach((grid) => grid.classList.add("hidden"));
        document.getElementById(btn.dataset.tab).classList.remove("hidden");
      });
    });
  
    document.getElementById("legend").addEventListener("click", () => {
        alert("All Normal Plants MUST be Unlocked Before Unlocking Legendary Plants")
    })

    document.querySelectorAll(".plant-card").forEach((card) => {
      card.addEventListener("click", () => {
        if (!card.classList.contains("locked")) {
          if(card.id === "ros"){
            alert(" 🌹 Congrats! You unlocked: " + card.dataset.plant);
          }else if(card.id === "mari"){
            alert(" 🏵️ Congrats! You unlocked: " + card.dataset.plant);
          }else if(card.id === "dahl"){
            alert(" 🌸 Congrats! You unlocked: " + card.dataset.plant);
          }else if(card.id === "tully"){
            alert(" 🌷 Congrats! You unlocked: " + card.dataset.plant);
          }else if(card.id === "hyac"){
            alert(" 🪻 Congrats! You unlocked: " + card.dataset.plant);
          }else if(card.id === "Hibby"){
            alert(" 🌺 Congrats! You unlocked: " + card.dataset.plant);
          }else{
            alert(" 🌸 Congrats! You unlocked: " + card.dataset.plant);
          }
        }
      });
    });
  });
  
