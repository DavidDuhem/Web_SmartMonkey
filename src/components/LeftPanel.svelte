
<script>
    import { onMount } from "svelte";
    import { conversations, currentConversation, messages, userMessages } from './store.js';
    import MdDelete from 'svelte-icons/md/MdDelete.svelte'

    const DATABASE_CHATS_URL = 'http://127.0.0.1:8090/api/collections/ochat_conversations/records';
    const DATABASE_MESSAGES_URL = 'http://127.0.0.1:8090/api/collections/ochat_messages/records';

    let addMoreInputValue;
    let selectedConvIndex = 0;

    async function initChatsList(){
        try{
            const response = await fetch(DATABASE_CHATS_URL);

            if(!response.ok)
            {
                throw new Error("Error : " + response.status)
            }
            
            const responseData = await response.json();

            for(const item of responseData.items)
            {
                conversations.update(current => [...current, {id: item.id, title: item.title, deletable: item.deletable}]);
            }

            if(responseData.items.length > 0)
            {
                // On refresh, set first conversation as default
                currentConversation.set(responseData.items[0].id);
            }
            else{
                // Incentive to create a conversation or create one auto (easy way I think)
                addConversation("Default Conversation", false);
            }
        }
        catch(error){
            console.error("Fetch Failed : " + error.message);
        }
    }

    async function handleConvDeleted(id){
        // Improvement would be a confirmation popup

        // Remove conversation from database
        try{
            await fetch(`${DATABASE_CHATS_URL}/${id}`, {
            method: "DELETE"
             });

            // Remove locally
            conversations.update(current => current.filter(current => current.id !== id));
            handleConvSelected($conversations[$conversations.length - 1].id);
        }
        catch(error){
            console.error("Fetch Failed : " + error.message);
        }

        // Get all messages with this id

        try{
            const response = await fetch(`${DATABASE_MESSAGES_URL}?filter=(relation='${id}')`);

            if (!response.ok) {
                throw new Error("Error : " + response.status)
            }

            const responseData = await response.json();
            const toDelete = responseData.items.map(item => item.id);

            if(toDelete.length > 0)
            {
                // Remove messages from database
                try{
                    const deleteResponse = toDelete.map(id =>
                        fetch(`${DATABASE_MESSAGES_URL}/${id}`,{
                        method: "DELETE"
                    }));

                    const responses = await Promise.all(deleteResponse);
                    const successfulDeletes = responses.every(response => response.ok);

                    if(successfulDeletes)
                    {
                        // Remove locally
                        messages.update(current => current.filter(current => current.relation !== id));
                        userMessages.update(current => current.filter(current => current.relation !== id));
                    }
                    else{
                        throw new Error("Error : " + response.status);
                    }
                }
                catch(error){
                    console.error("Fetch Failed : " + error.message);
                }
            }
        }
        catch(error){
            console.error("Fetch Failed : " + error.message);
        }
    }

    function handleConvSelected(id, index){
        if($currentConversation != id)
        {
            currentConversation.set(id);
            selectedConvIndex = index;
        }
    }

    function handleAddConv()
    {
        if(addMoreInputValue.trim() !== "")
        {
            addConversation(addMoreInputValue, true);
            addMoreInputValue = "";
        }
    }

    async function addConversation(name, deletable){

        const formData = new FormData();
        formData.append("title", name);
        formData.append("deletable", deletable);

        try{
            const response = await fetch(DATABASE_CHATS_URL,{
                method: "POST",
                body: formData,
            });

            if(!response.ok){
                throw new Error("Error : " + response.status)
            }
            
            const responseData = await response.json();

            conversations.update(current => [...current, {id: responseData.id, title: name, deletable: deletable}]);
            handleConvSelected($conversations[$conversations.length - 1].id, $conversations.length - 1);
        }
        catch(error){
            console.error("Fetch Failed : " + error.message);
        }
    }

    onMount(() => {
        initChatsList();
    });

</script>

<h1>Conversations</h1>


<div class="list-conv">
    <ul>
    {#each $conversations as item, index}
        <!-- Add Accessibility feature with keyboard  -->
        <li class="conv" class:selected={selectedConvIndex === index} on:click={() => handleConvSelected(item.id, index)}>
            <p>{item.title}</p>
            {#if item.deletable}
            <span class="conv-more" on:click={() => handleConvDeleted(item.id)}><MdDelete /></span>
            {/if}
        </li>
    {/each}
    </ul>
</div>
<form on:submit={handleAddConv} class="addNew">
    <input type="text" placeholder="Enter Chat Name" bind:value={addMoreInputValue}/>
    <button type="submit" class="add-btn">Add</button>
</form>

<style>

    h1{
        text-align: center;
    }

    .addNew{
        display: flex;
        flex: 1;
        justify-content: flex-end;
        align-items: center;
        gap: 0.8rem;
        flex-direction: column;
    }

    .add-btn{
        border-radius: 10px;;
        height: 2.5rem;
        font-size: 1.3rem;
        background-color: #25852a;
    }

    input, button{
        box-sizing: border-box;
        width: 100%;
        height: 2rem;
        text-align: center;
    }

    input{
        resize: none;
        width: 100%;
        height: 2.5rem;
        border-radius: 10px;
        padding: 0.5rem 1.5rem;
        overflow: hidden;
        background-color: #585858;
        font-size: 1.3rem;
    }

    ul{
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .conv{
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        list-style: none;
        font-weight: bold;
        padding: 0 1rem 0 2rem;
        border-radius: 7px;
    }

    .selected{
        background-color: #272727;
    }

    .conv .conv-more{
        visibility: hidden;
        width: 1.5rem;
        height: 1.5rem;
        aspect-ratio: 1;
        color: #EEEEEE;
    }

    .conv:hover{
        cursor: pointer;
        background-color: #222222;
    }

    .conv:hover .conv-more{
        visibility: visible;
    }

    .conv p{
        font-size: 1.2rem;
        margin: 0.8rem 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    ul{
        padding-left: 0;
    }

    h1{
        font-size: 1.4rem;
    }

</style>