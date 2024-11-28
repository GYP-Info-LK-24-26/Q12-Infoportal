<script lang="ts">
    import { page } from "$app/stores";
    import { clickOutside } from "$lib/clickOutside";

    $: user = $page.data.user;
    let showProfileInfo = false;
</script>

<div>
    {#if user}
        <div use:clickOutside on:click_outside={() => showProfileInfo = false}>
            <button class="profile" on:click={() => showProfileInfo = !showProfileInfo}>
                {`${user.firstName?.at(0)}${user.lastName?.at(0)}`}
            </button>
            {#if showProfileInfo}
                <ul class="submenu profileInfo">
                    <li>{`${user.firstName.split(' ')[0]} ${user.lastName.split(' ')[0]}`}</li>
                    <hr>
                    <li>
                        <form action="/logout" method="POST">
                            <button type="submit">
                                Abmelden
                            </button>
                        </form>
                    </li>
                </ul>
            {/if}
        </div>
    {:else}
        <a href="/login" class="login">Anmelden</a>
    {/if}
</div>

<style>
    .profile {
        background-color: var(--color-bg-2);
        border-radius: 50%;
        border-style: none;
        width: 2rem;
        height: 2rem;
    }

    .profileInfo {
        right: 0;
    }
</style>