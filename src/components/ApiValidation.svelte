<script>
    import { onMount } from "svelte";
    const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

    let apiInputElement;
    let apiInputValue;
    export let onApiValidated;

    async function verifyApiKey(){
        apiInputElement.value = "";
        try{
            const response = await fetch(MISTRAL_API_URL,{
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${apiInputValue}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'mistral-large-latest',
                    messages: [{ role: 'user', content: "test" }]
                })
            });

            if(response.ok)
            {
                localStorage.setItem("API_KEY", apiInputValue);
                onApiValidated?.();
            }
            else{
                throw new Error("Error : " + response.status)
            }
        }
        catch(error){
            console.error("Fetch Failed : " + error.message);
            throw error;
        }
    }

</script>


<section id="api-init">
    <div class="title">
        <h1>SUPER CHAT BOT</h1>
    </div>
    <div class="box">
        <input type="text" placeholder="Enter an API KEY" bind:value={apiInputValue} bind:this={apiInputElement}/>
        <button type="submit" on:click={verifyApiKey}>Enter</button>
    </div>
</section>

<style>

    #api-init{
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .box{
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
    }

    input, button{
        height: 2rem; 
        font-size: 1.2rem;
        color: black;
    }

    input::placeholder{
        color: black;
    }

    input{
        width: 20rem;
        padding: 1rem;
    }

    button{
        width: 8rem;
    }

</style>