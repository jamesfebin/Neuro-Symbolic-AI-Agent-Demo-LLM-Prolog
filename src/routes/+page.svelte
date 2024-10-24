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
      // Get Prolog query from OpenAI
      const prologQuery = await getPrologQuery(userQuestion);
      console.log('Generated Prolog Query:', prologQuery);

      // Execute Prolog query
      let prologResult;
      try {
        prologResult = await queryProlog(prologQuery);
        console.log('Prolog Results:', prologResult);
      } catch (prologError) {
        prologResult = `Error executing Prolog query: ${prologError.message}`;
        console.error('Prolog Error:', prologError);
      }

      // Process the Prolog result with OpenAI
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

<section class="section">
  <div class="container">
    <h1 class="title is-1 has-text-centered">College Chatbot</h1>
    
    <div class="box">
      <div class="content">
        {#each chatHistory as chat}
          <div class="message {chat.sender === 'User' ? 'is-primary' : 'is-info'}">
            <div class="message-header">
              <p>{chat.sender}</p>
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
            class="input" 
            type="text" 
            bind:value={userQuestion} 
            placeholder="Ask a question..." 
            on:keydown={(e) => e.key === 'Enter' && handleSubmit()}
          >
        </div>
        <div class="control">
          <button 
            class="button is-primary" 
            on:click={handleSubmit} 
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .content {
    height: 400px;
    overflow-y: auto;
    margin-bottom: 1rem;
  }
</style>
