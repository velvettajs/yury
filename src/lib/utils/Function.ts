import { createHash, randomUUID } from 'node:crypto';
import { type AutocompleteInteraction, type CommandInteraction } from 'discord.js';
import axios from 'axios';

const API_URL: Readonly<string> = 'https://discord.com/api/v9';
const PLANS: ReadonlyArray<string> = ['lifetime', 'monthly', 'annual'];

const emojis: { [key: string]: string } = {
	verified_developer: `<:verified_developer:1127326470793084958>`,
	staff: '<:staff:1127329116669095946>',
	premium: '<:premium:1127326478145691698>',
	legacy_username: '<:legacy_username:1127326605346357268>',
	active_developer: '<:active_developer:1127329114160889877>',
	bug_hunter_level_1: '<:bug_hunter_level_1:1127326566326739135>',
	bug_hunter_level_2: '<:bug_hunter_level_2:1127326649797574736>',
	certified_moderator: '<:certified_moderator:1127329119173087264>',
	early_supporter: '<:early_supporter:1127327191856853053>',
	hypesquad: '<:hypesquad:1127329117889638520>',
	hypesquad_house_1: '<:hypesquad_house_1:1127326472466608180>',
	hypesquad_house_2: '<:hypesquad_house_2:1127326474714763334>',
	hypesquad_house_3: '<:hypesquad_house_3:1127326449846734948>'
};

const icons: { [key: string]: string } = {
	guild_booster_lvl1: '<:lovver_boost1m:1127326452401066014>',
	guild_booster_lvl2: '<:lovver_boost2m:1127326454229774447>',
	guild_booster_lvl3: '<:lovver_boost3m:1127326456305942589>',
	guild_booster_lvl4: '<:lovver_boost6m:1127326459153875005>',
	guild_booster_lvl5: '<:lovver_boost9m:1127326461561426091>',
	guild_booster_lvl6: '<:lovver_boost12m:1127326463335596094>',
	guild_booster_lvl7: '<:lovver_boost15m:1127326465806057602>',
	guild_booster_lvl8: '<:lovver_boost18m:1127326467206955138>',
	guild_booster_lvl9: '<:lovver_boost24m:1127326468435878011>'
};

export async function getUser(id: string): Promise<IUser | undefined> {
	if (!id) throw Error('ID Invalid!');
	try {
		const { data } = await axios.get(`${API_URL}/users/${id}/profile`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: process.env.DISCORD_SYSTEM_TOKEN as string
			}
		});
		const premium = getBoost(data.badges, data?.premium_since, data?.premium_guild_since);
		const badges = getBadges(data.badges);
		return {
			id: data.user.id,
			name: data.user.global_name,
			username:
				data.user.discriminator !== '0' ? `${data.user.username}#${data.user.discriminator}` : data.user.username,
			legacy_username: data.legacy_username,
			pronouns: data.user_profile.pronouns,
			avatar: `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}`,
			accounts: data.connected_accounts,
			badges,
			premium
		} as IUser;
	} catch (error) {
		return undefined;
	}
}

export function getFlags(bits: number | undefined): IBadge[] | null {
	const badges: IBadge[] = [];
	if (!bits) return null;

	return !badges.length ? null : badges;
}

function getBadges(inputs: any | null): IBadge[] | null {
	const badges: IBadge[] = [];
	if (!inputs.length) return null;
	const filterBadges = inputs.filter(({ id }: { id: string }) => !id.includes('guild_booster_lvl'));

	filterBadges.map(({ id, name }: { id: string; name: string }) => {
		badges.push({
			name,
			emoji: `${emojis[id]}`
		});
	});
	return !badges.length ? null : badges;
}

function getActualDate(boost: Date): string {
	let date = new Date();
	let diff = date.getTime() - boost.getTime();

	let millisecondsPerDay = 1000 * 60 * 60 * 24;
	let days = Math.floor(diff / millisecondsPerDay);
	let months = Math.floor(days / 30.44);
	let remainingDays = days - months * 30.44;
	let hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

	return `${months} month(s) ${Math.floor(remainingDays)} day(s) and ${hours} hour(s) ago.`;
}

function getNextDate(boost: Date, level: number): Date | undefined {
	const levels: { [key: number]: number } = {
		1: 1,
		2: 2,
		3: 3,
		4: 6,
		5: 9,
		6: 12,
		7: 15,
		8: 18,
		9: 24
	};
	const levelUp: number | undefined = levels[level + 1];
	if (!levelUp) return undefined;
	const nextTier: Date = new Date(boost.setMonth(boost.getMonth() + levelUp));
	return nextTier;
}

function getBoost(
	flags: { [key: string]: string }[],
	premium_since: string | undefined,
	guild_since: string | undefined
): IPremium | undefined {
	if (!premium_since || !guild_since) return undefined;
	if (!flags.length) return undefined;

	const badges: IBadge[] = flags.map(({ id, icon }) => ({ name: id || undefined, emoji: icon || undefined } as IBadge));
	const boost_levels = badges.find(({ name }) => name.includes('guild_booster')) as IBadge;
	const boost = boost_levels.name.split('guild_booster_lvl');
	const boost_actual = {
		emoji: icons['guild_booster_lvl' + boost[1]],
		date: getActualDate(new Date(guild_since))
	};
	const nextDate = (boost[1] && getNextDate(new Date(guild_since), parseInt(boost[1]))) || undefined;
	const boost_up =
		boost[1] && nextDate
			? {
					emoji: icons['guild_booster_lvl' + (parseInt(boost[1]) + 1)],
					date: nextDate
			  }
			: undefined;

	return {
		boost_actual,
		boost_up
	} as IPremium;
}

const encodeHash = (id: string): string => {
	const hash = createHash('sha256');
	const key = hash.update(id).digest('hex');
	return key;
};

const getExpire = (plan: string): Date | number => {
	const date = new Date();
	if (plan === PLANS[0]) return Infinity;
	if (plan === PLANS[1]) return date.setMonth(date.getMonth() + 1);
	if (plan === PLANS[2]) return date.setFullYear(date.getFullYear() + 1);
	return date;
};

export function getSubscription(plan: string): ISubscription {
	if (!plan) throw Error('No plan');
	if (!plan || !PLANS.includes(plan)) throw Error('No plan valid');
	const key = encodeHash(randomUUID());
	const expires = getExpire(plan);

	const subscription: ISubscription = {
		name: plan,
		key,
		expires
	};
	return subscription;
}

export function formatArray(
	input: string[],
	options: { style?: Intl.ListFormatStyle; type?: Intl.ListFormatType } = {}
): string {
	const { style = 'short', type = 'conjunction' } = options;
	return new Intl.ListFormat('en-US', { style, type }).format(input);
}

export function formatPermissions(input: string): string {
	return input
		.replace(/(?<!^)([A-Z][a-z]|(?<=[a-z])[A-Z])/g, ' $1')
		.replace(/To|And|In\b/g, (txt) => txt.toLowerCase())
		.replace(/ Instant| Embedded/g, '')
		.replace(/Guild/g, 'Server')
		.replace(/Moderate/g, 'Timeout')
		.replace(/TTS/g, 'Text-to-Speech')
		.replace(/Use VAD/g, 'Use Voice Activity');
}

export function resolveCommandName(
	interaction: CommandInteraction<'cached' | 'raw'> | AutocompleteInteraction<'cached' | 'raw'>
): string {
	if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return interaction.commandName;

	const topLevelCommand = interaction.commandName;
	const subCommandGroup = interaction.options.getSubcommandGroup(false);
	const subCommand = interaction.options.getSubcommand(false);

	const command = [
		topLevelCommand,
		...(subCommandGroup ? [subCommandGroup] : []),
		...(subCommand ? [subCommand] : [])
	].join(' ');

	return command;
}