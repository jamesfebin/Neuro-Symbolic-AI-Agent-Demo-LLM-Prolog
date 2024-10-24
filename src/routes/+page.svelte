<script>
  import { onMount } from 'svelte';
  import { initializeProlog, queryProlog } from '$lib/prolog';
  import { getPrologQuery, processOpenAIResponse } from '$lib/openai';

  let userQuestion = '';
  let chatHistory = [];
  let isLoading = false;

  onMount(async () => {
    await initializeProlog();
  });

  async function handleSubmit() {
    if (!userQuestion.trim()) return;
    isLoading = true;
    chatHistory = [...chatHistory, { sender: 'User', message: userQuestion }];

    try {
      const prologQuery = await getPrologQuery(userQuestion);
      console.log('Generated Prolog Query:', prologQuery);

      let prologResult;
      try {
        prologResult = await queryProlog(prologQuery);
        console.log('Prolog Results:', prologResult);
      } catch (prologError) {
        prologResult = `Error executing Prolog query: ${prologError.message}`;
        console.error('Prolog Error:', prologError);
      }

      const openAIResponse = await processOpenAIResponse(userQuestion, prologQuery, prologResult);

      chatHistory = [...chatHistory, { sender: 'Bot', message: openAIResponse }];
    } catch (error) {
      console.error(error);
      chatHistory = [
        ...chatHistory,
        { sender: 'Bot', message: `An error occurred: ${error.message}. Please try again.` },
      ];
    } finally {
      userQuestion = '';
      isLoading = false;
    }
  }
</script>

<div class="page-background">
  <section class="section">
    <div class="container">
      <h1 class="title is-1 has-text-centered mb-6 has-text-white">
        🧠 Neuro Symbolic AI Agent
        <br>
        <span class="subtitle is-3 has-text-white">(Prolog + LLM)</span>
      </h1>
      
      <div class="box chat-box">
        <div class="content chat-content">
          {#each chatHistory as chat}
            <div class="message {chat.sender === 'User' ? 'is-primary' : 'is-info'}">
              <div class="message-header">
                <p>{chat.sender === 'User' ? '👤 You' : '🤖 AI'}</p>
              </div>
              <div class="message-body">
                {chat.message}
              </div>
            </div>
          {/each}

          {#if isLoading}
            <progress class="progress is-small is-primary" max="100">15%</progress>
          {/if}
        </div>

        <div class="field has-addons">
          <div class="control is-expanded">
            <input 
              class="input is-large custom-input"
              type="text" 
              bind:value={userQuestion} 
              placeholder="🤔 Ask a question..." 
              on:keydown={(e) => e.key === 'Enter' && handleSubmit()}
            >
          </div>
          <div class="control">
            <button 
              class="button is-primary is-large custom-button"
              on:click={handleSubmit} 
              disabled={isLoading}
            >
              <span class="icon">
                <i class="fas fa-paper-plane"></i>
              </span>
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .page-background {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 2rem 0;
  }

  .chat-box {
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .chat-content {
    height: 400px;
    overflow-y: auto;
    margin-bottom: 1.5rem;
    padding-right: 0.75rem;
  }

  .custom-input {
    border-radius: 25px 0 0 25px !important;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .custom-button {
    border-radius: 0 25px 25px 0 !important;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  /* Custom scrollbar for Webkit browsers */
  .chat-content::-webkit-scrollbar {
    width: 8px;
  }

  .chat-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  .chat-content::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }

  .chat-content::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  .message {
    margin-bottom: 1rem;
  }

  .message-header {
    border-radius: 10px 10px 0 0;
  }

  .message-body {
    border-radius: 0 0 10px 10px;
  }
</style>
