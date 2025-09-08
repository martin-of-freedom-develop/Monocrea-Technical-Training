<style>
    p {
        color: goldenrod;
        font-family: 'Comic Sans MS', cursive;
        font-size: 2em;
    }
    /*こちらを利用する場合はコメントアウトを外してください。*/
    /*div {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        padding: 1rem;
    }*/
</style>
<script module>
    export const ssr = false;
</script>
<script lang="ts">
    import Nested from './Nested.svelte';
    import Counter from './Counter.svelte';
    import PackageInfo from './PackageInfo.svelte';
    import Thing from './Thing.svelte';
    import {roll} from './utils.js';
    import Stepper from './Stepper.svelte';
    import BigRedButton from './BigRedButton.svelte';
    import horn from './horn.mp3';

    let name=$state('Svelte');

    let src='/tutorial/image.gif';

    let string = `this string contains some <strong>HTML!!!</strong>`;

    let count= $state(0);

    let numbers=$state([1,2,3,4]);

    let total=$derived(numbers.reduce((t,n)=>t+n,0))

    let elapsed=$state(0);

    let interval=$state(1000);

    const colors = ['red','orange','yellow','green','blue','indigo','violet'];

    // let selected=$state(colors[0])

    let things=$state([
        {id: 1, name: 'apple'},
        {id: 2, name: 'banana'},
        {id: 3, name: 'carrot'},
        {id: 4, name: 'doughnut'},
        {id: 5, name: 'egg'}
    ]);

    let promise=$state(roll());

    let m=$state({x:0, y:0});

    let value=$state(0);

    let a=$state(1);

    let b=$state(2);

    let yes=$state(false);

    let questions=$state([
        {
            id: 1,
            text: `Where did you go to school?`
        },
        {
            id: 2,
            text: `What is your mother's name?`
        },
        {
            id: 3,
            text: `What is another personal fact that an attacker could easily find with Google?`
        }
    ]);

    let selected=$state();

    let answer=$state('');

    let scoops = $state(1);

    let flavours = $state([]);

    const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });

    const audio = new Audio();
    audio.src = horn;

    function increment() {
        count+=1;
    }

    function addNumber() {
        // numbers[numbers.length]=numbers.length+1;
        numbers.push(numbers.length+1);
        console.log($state.snapshot(numbers));
    }

    // こちらを利用する場合はコメントアウトを外してください。
    // function onpointermove(event){
        // m.x=event.clientX;
        // m.y=event.clientY;
    // }

    function honk() {
        audio.load();
        audio.play();
    }

    function handleSubmit(e) {
        e.preventDefault();

        alert(
            `answered question ${selected.id} (${selected.text}) with "${answer}"`
        );
    }

    $inspect(numbers).with(console.trace);

    $effect(()=>{
        const id=setInterval(()=>{
            elapsed+=1;
        },interval);

        return ()=>{
            clearInterval(id);
        };
    });

    const pkg={
        name: 'svelte',
        version: 5,
        description: 'blazing fast',
        website: 'https://svelte.dev'
    }

</script>
<img {src} alt="{name} dances."/>
<h1>Hello {name.toUpperCase()}!</h1>
<p>This is a paragraph.</p>
<p>{@html string}</p>

<Nested answer={42}/>
<Nested/>

<button onclick={increment}>
    Clicked {count}
    {count===1 ? 'time':'times'}
</button>

{#if count > 10}
    <p>{count} is greator than 10</p>
{:else if count < 5}
    <p>{count} is less than 5</p>
{:else}
    <p>{count} is between 0 and 10</p>
{/if}

<p>{numbers.join('+')}={total}</p>

<button onclick={addNumber}>
    Add a number
</button>

<br>

<button onclick={()=>interval/=2}>speed up</button>
<button onclick={()=>interval+=2}>slow down</button>

<p>elapsed: {elapsed}</p>

<Counter />
<Counter />
<Counter />

<PackageInfo {...pkg}/>

<!--h1 style="color: {selected}">Pick a colour</h1-->

<!--こちらを利用する場合はコメントアウトを外してください。-->
<!--div>
    {#each colors as color, i}
        <button
            style="background: {color}"
            aria-label={color}
            aria-current={selected===color}
            onclick={()=>selected=color}
        >{i+1}</button>
    {/each}
</div-->

<br>

<button onclick={()=>things.shift()}>
    Remove first thing
</button>

{#each things as thing (thing.id)}
    <Thing name={thing.name}/>
{/each}

<button onclick={()=>promise=roll()}>
    roll the dice
</button>

{#await promise}
    <p>...rolling</p>
{:then number}
    <p>you rolled a {number}!</p>
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}

<!--こちらを利用する場合はコメントアウトを外してください。-->
<!--div {onpointermove}>
    The pointer is at {Math.round(m.x)} x {Math.round(m.y)}
</div>

<div
	onpointermove={(event) => {
		m.x = event.clientX;
		m.y = event.clientY;
	}}
>
	The pointer is at {Math.round(m.x)} x {Math.round(m.y)}
</div-->

<div onkeydown={(e)=>alert(`<div> ${e.key}`)} role="presentation">
    <input onkeydown={(e) => alert(`<input> ${e.key}`)} />
</div>

<p>The current value is {value}</p>

<Stepper
    increment={()=>value+=1}
    decrement={()=>value-=1}
/>

<br>
<br>

<BigRedButton onclick={honk} />

<br>
<br>

<input value={name}/>
<h1>Hello {name}!</h1>

<br>
<br>

<label>
    <input type="number" bind:value={a} min="0" max="10"/>
    <input type="range" bind:value={a} min="0" max="10"/>
</label>

<label>
    <input type="number" bind:value={b} min="0" max="10"/>
    <input type="range" bind:value={b} min="0" max="10"/> 
</label>

<p>{a}+{b}={a+b}</p>

<label>
    <input type="checkbox" bind:checked={yes}/>
    Yes! Send me regular email spam
</label>

{#if yes}
    <p>
        Thank you. We will bombard your inbox and sell
        your personal details.
    </p>
{:else}
    <p>
        You must opt in to continue. If you're not
        paying, you're the product.
    </p>
{/if}

<button disabled={!yes}>Subscribe</button>

<h2>Insecurity questions</h2>

<form onsubmit={handleSubmit}>
    <select
        value={selected}
        onchange={() => (answer = '')}
    >
        {#each questions as question}
            <option value={question}>
                {question.text}
            </option>
        {/each}
    </select>

    <input bind:value={answer} />

    <button disabled={!answer} type="submit">
        Submit
    </button>
</form>

<p>
    selected question {selected ? selected.id : '[waiting...]'}
</p>

<h2>Size</h2>

{#each [1, 2, 3] as number}
    <label>
        <input
            type="radio"
            name="scoops"
            value={number}
            bind:group={scoops}
        />

        {number} {number === 1 ? 'scoop' : 'scoops'}
    </label>
{/each}

<h2>Flavours</h2>

{#each ['cookies and cream', 'mint choc chip', 'raspberry ripple'] as flavour}
    <label>
        <input
            type="checkbox"
            name="flavours"
            value={flavour}
            bind:group={flavours}
        />

        {flavour}
    </label>
{/each}

{#if flavours.length === 0}
    <p>Please select at least one flavour</p>
{:else if flavours.length > scoops}
    <p>Can't order more flavours than scoops!</p>
{:else}
    <p>
        You ordered {scoops} {scoops === 1 ? 'scoop' : 'scoops'}
        of {formatter.format(flavours)}
    </p>
{/if}
