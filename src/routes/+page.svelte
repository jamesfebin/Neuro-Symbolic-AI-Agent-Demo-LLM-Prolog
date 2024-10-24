<script>
  import { onMount } from 'svelte';
  import { processConversation } from '$lib/openai';
  import { marked } from 'marked';
  import { initializeProlog } from '$lib/prolog';

  let userQuestion = '';
  let chatHistory = [];
  let isLoading = false;
  let chatContainer;

  onMount(() => {
    initializeProlog();
    scrollToBottom();
  });

  async function handleSubmit() {
    if (!userQuestion.trim()) return;
    isLoading = true;
    chatHistory = [...chatHistory, { role: 'user', content: userQuestion }];
    const currentQuestion = userQuestion;
    userQuestion = ''; // Clear the input immediately
    scrollToBottom();

    try {
      const aiResponse = await processConversation(currentQuestion, chatHistory);
      chatHistory = [...chatHistory, { role: 'assistant', content: aiResponse }];
      scrollToBottom();
    } catch (error) {
      console.error(error);
      chatHistory = [
        ...chatHistory,
        { role: 'assistant', content: `An error occurred: ${error.message}. Please try again.` },
      ];
    } finally {
      isLoading = false;
      scrollToBottom();
    }
  }

  function renderMarkdown(text) {
    return marked(text);
  }

  function scrollToBottom() {
    setTimeout(() => {
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 0);
  }
</script>

<div class="page-background">
  <section class="section">
    <div class="container">
      <h1 class="title is-1 has-text-centered mb-6 has-text-white">
        🧠💻 Neuro Symbolic AI Agent 🤖🔬
        <br>
        <span class="subtitle is-3 has-text-white">(Prolog + LLM)</span>
      </h1>
      
      <div class="box chat-box">
        <div class="content chat-content" bind:this={chatContainer}>
          {#each chatHistory as chat}
            <div class="message {chat.role === 'user' ? 'is-primary' : 'is-info'}">
              <div class="message-header">
                <p>{chat.role === 'user' ? '👨‍🎓 You' : '🤖 AI'}</p>
              </div>
              <div class="message-body">
                {@html renderMarkdown(chat.content)}
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
              on:keydown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
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

  :global(.message-body pre) {
    background-color: #f5f5f5;
    color: #4a4a4a;
    font-size: 0.875em;
    overflow-x: auto;
    padding: 1.25rem 1.5rem;
    white-space: pre;
    word-wrap: normal;
  }

  :global(.message-body code) {
    background-color: #f5f5f5;
    color: #da1039;
    font-size: 0.875em;
    font-weight: normal;
    padding: 0.25em 0.5em 0.25em;
  }

  :global(.message-body ul) {
    list-style-type: disc;
    padding-left: 2em;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }

  :global(.message-body ol) {
    list-style-type: decimal;
    padding-left: 2em;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }

  :global(.message-body a) {
    color: #3273dc;
    cursor: pointer;
    text-decoration: none;
  }

  :global(.message-body a:hover) {
    color: #363636;
    text-decoration: underline;
  }
</style>
