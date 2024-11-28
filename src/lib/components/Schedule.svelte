<script lang="ts">
    import { onMount } from "svelte";

    type ScheduleData = {
        lessonTimes: {
            start: string,
            end: string
        }[],
        daysOfTheWeek: string[],
        lessons: {
            teacher: string,
            room: string,
            course: string,
            subject: string
        }[][]
    };

    let promise: Promise<ScheduleData> | undefined; 
    onMount(() => {
        promise = fetch('/schedule').then(res => res.json());
    });
</script>

<table>
    {#if promise}
	    {#await promise}
			<tr><td>Lade Stundenplan...</td></tr>
		{:then schedule}
			<tr>
				<th></th>
				{#each schedule.daysOfTheWeek as day}
					<th>{day}</th>
				{/each}
			</tr>
			{#each schedule.lessonTimes as lessonTime, i}
				<tr>
					<td>
						{lessonTime.start} - {lessonTime.end}
					</td>
					{#each schedule.daysOfTheWeek as _, j}
					<td>
                        <div class="top-left corner">{schedule.lessons[j]?.at(i)?.subject ?? ''}</div>
                        <div class="top-right corner">{schedule.lessons[j]?.at(i)?.course ?? ''}</div>
                        <div class="bottom-left corner">{schedule.lessons[j]?.at(i)?.teacher ?? ''}</div>
                        <div class="bottom-right corner">{schedule.lessons[j]?.at(i)?.room ?? ''}</div>
					</td>
					{/each}
				</tr>
			{/each}
		{:catch e}
			An error occured: {e}
		{/await}
    {/if}
</table>

<style>
    table {
        border-collapse: collapse;
    }

    table, th, td {
        border: 1px solid;
    }

    th, td {
        width: 8rem;
        height: 3rem;
        padding: 5px;
    }

    td {
        position: relative;
    }

    .corner {
        position: absolute;
        padding: 0.3rem;
    }

    .top-left {
        left: 0;
        top: 0;
    }

    .top-right {
        right: 0;
        top: 0;
    }

    .bottom-left {
        left: 0;
        bottom: 0;
    }

    .bottom-right {
        right: 0;
        bottom: 0;
    }
</style>