<script>
    import AddButton from "./AddButton.svelte";
    import IoMdSend from 'svelte-icons/io/IoMdSend.svelte'
    import { messages, userMessages, currentConversation } from './store.js';

    let textarea;
    let textareaValue = "";
    const originHeight = 2.5;

    const DATABASE_MESSAGES_URL = 'http://127.0.0.1:8090/api/collections/ochat_messages/records';

    const resizeTextarea = () => {
        textarea.style.height = `${textarea.scrollHeight}px`
        textarea.style.marginBottom = `calc(${textarea.scrollHeight}px - ${originHeight}rem)`;
    }

    function handleSubmit(event)
    {
        event.preventDefault();
        sendMessage();
    }

    function sendMessage(){

        if(textareaValue.trim() !== "")
        {
            const formData = new FormData();
            formData.append("content", textareaValue);
            formData.append("is_ai", "false");
            formData.append("relation", $currentConversation);
            addEntryToChatDatabase(formData);
            
            userMessages.update(current => [...current, textareaValue, $currentConversation]);
            messages.update(current => [...current, {is_ai: false, content: textareaValue, relation: $currentConversation}]);
            textarea.value = "";
            textareaValue = "";
        }
    }

    function onKeyDown(event)
    {
        if (event.key === 'Enter')
        {
            event.preventDefault();
            sendMessage();
        }
    }

    async function addEntryToChatDatabase(entry)
    {
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

</script>

<div class="inputZone">
    <AddButton />
    <form on:submit={handleSubmit}>
        <textarea placeholder="Ask the chat" class="user-chat-input" on:keydown={onKeyDown} bind:this={textarea} bind:value={textareaValue} on:input={resizeTextarea}></textarea>
        <button type="submit">
            <IoMdSend />
        </button>
    </form>
</div>

<style>

    .inputZone{
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.8rem;
        flex: 1;
    }

    form{
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.8rem;
        width: 100%;
    }

    textarea{
        resize: none;
        width: 100%;
        height: 2.5rem;
        border-radius: 10px;
        padding: 0.5rem 1.5rem;
        overflow: hidden;
        background-color: #585858;
        font-size: 1.3rem;
    }

    button{
        height: 3rem;
        aspect-ratio: 1;
        background-color: rgba(100, 100, 100, 0);
        border:none;
        color: rgb(58, 105, 190);
    }

    button:hover{
        color: rgb(44, 85, 161);
    }


    @media (min-width: 900px) {
        textarea{
            width: 58%;
        }
    }

</style>