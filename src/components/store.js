import { writable } from "svelte/store";

export const messages = writable([]);
export const userMessages = writable([]);

export const conversations = writable([]);
export let currentConversation = writable("");
