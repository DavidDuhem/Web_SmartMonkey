<script>
    import { onMount } from "svelte";
    import { get } from 'svelte/store';
    import { tick } from 'svelte';
    import { currentConversation, messages, userMessages } from './store.js';
    import Markdown from 'svelte-exmarkdown';

    export let onNewMessage;

    let previousMessagesLength = $userMessages.length;

    $: lastUserMessage = $userMessages[$userMessages.length - 1];

    $: if(lastUserMessage) {
        const currentLength = $userMessages.length;
        if(currentLength > previousMessagesLength)
        {
            console.log("RUNNING AI");

            previousMessagesLength = currentLength;
            runAI($userMessages[currentLength - 1], get(currentConversation));
            runAfterUpdate();
        }
        else{
            previousMessagesLength = currentLength;
        }
    }

    // SHOULD BE IN GLOBAL FILE FOR CONST
    const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
    const DATABASE_MESSAGES_URL = 'http://127.0.0.1:8090/api/collections/ochat_messages/records';

    // Also maybe I should put anything database/API related elsewhere but it's convenient for now
    async function runAI(prompt, id){
        try{
            const response = await fetch(MISTRAL_API_URL,{
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("API_KEY")}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'mistral-large-latest',
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            if(!response.ok)
            {
                throw new Error("Error : " + response.status)
            }

            const data = await response.json();

            if(data.choices.length > 0)
            {
                const message = data.choices[0].message.content;
                const formData = new FormData();
                formData.append("content", message);
                formData.append("is_ai", "true");
                formData.append("relation", id);

                await addEntryToDataBase(formData);

                messages.update(current => [...current, {is_ai: true, content: message, relation: id}]);
                runAfterUpdate();
            }
        }
        catch(error){
            console.error("Fetch Failed : " + error.message);
        }
    }

    async function addEntryToDataBase(entry){
        try{
            await fetch(DATABASE_MESSAGES_URL,{
                method: "POST",
                body: entry,
            });
        }
        catch(error){
            console.error("Fetch Failed : " + error.message);
        }
    }

    async function runAfterUpdate(){
        await tick();
        onNewMessage?.();
    }

    async function initChat(){
        try{
            const response = await fetch(DATABASE_MESSAGES_URL);

            if(!response.ok)
            {
                throw new Error("Error : " + response.status)
            }

            const responseData = await response.json();
            
            for(const item of responseData.items)
            {
                messages.update(current => [...current, {content: item.content, is_ai: item.is_ai, relation: item.relation}]);
            }
        }
        catch(error){
            console.error("Fetch Failed : " + error.message);
        }
    }

    onMount(() => {
        onNewMessage?.();
        initChat();
    });

</script>


{#each $messages as item}
    <!-- Would it be better to fetch each time a conversation is selected and not keep track locally ? -->
    {#if item.relation === $currentConversation}
        {#if !item.is_ai}
            <div class="user">
                <p>{item.content}</p>
                <div class="avatar">
                    <img class="avatar" src="/user-avatar.jpg" alt="user avatar"/>
                </div>
            </div>
        {:else}
            <div class="ai">
                <p><Markdown md={item.content} /></p>
                <div class="avatar">
                    <img class="avatar" src="/ai-avatar.png" alt="ai avatar"/>
                </div>
            </div>
        {/if}
    {/if}

{/each}

<style>
    .user{
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        gap: 1rem;
        margin: 1rem;
    }

    .ai{
        display: flex;
        flex-direction: row-reverse;
        justify-content: flex-end;
        gap: 1rem;
        margin: 1rem;
    }

    .avatar{
        width: 3rem;
        height: 3rem;
        border-radius: 25px;
        aspect-ratio: 1;
        background-color: rgb(233, 233, 233);
    }

    .user > p{
        border-radius:  10px 0 10px 10px;
        background-color: #424242;
    }

    .ai > p{
        border-radius:  0 10px 10px 10px;
        background-color: #303030;
    }

    p{
        padding: 1rem 2rem;
        font-size: 1.3rem;
    }
</style>