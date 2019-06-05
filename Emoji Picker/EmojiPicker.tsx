import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Frame, addPropertyControls, ControlType } from 'framer';
import { EmojiCard } from './EmojiCard';
import * as data from './EmojiData.json';

export function EmojiPicker(props) {
	// Here i'm creating all the states using the useState hook
	const [description, setDescription] = useState(''); // This is the emoji's name
	const [hoveredEmoji, setHoveredEmoji] = useState(''); // This is the emoji that's being hovered
	const [scrollPos, setScrollPos] = useState(0); // Storing the scrollPos in a state
	const [emojis, setEmojis] = useState(data); // Storing all the emojis in a state variable (Can modify with search)
	const [searching, setSearching] = useState(false); // State used to tell whether or not the component is in search mode

	// Here i'm creating a reference to the scroll (I like the native bounce, so I'm using overflow : auto to achieve this)
	let scrollerRef = useRef({
		scrollTop: 0
	});

	// I'm storing a few colors in here based off the isDarkMode prop
	// I show more methods of styling later on
	let colors = {
		emojiEnabled: props.isDarkMode ? '#EEE' : '#05F',
		emojiDisabled: props.isDarkMode ? '#666' : '#999'
	};

	// Here's the click event, pulling from the EmojiCard component.
	// This is an example of the "lifting state", it passes in the handleClick as a prop
	// to the EmojiCard.
	function handleClick(emoji) {
		const { onClick } = props;
		onClick && onClick(emoji);
	}

	// Here's the hover event, another event that's "lifting state" from the EmojiCard component
	function handleHover(description, emoji) {
		setDescription(description);
		setHoveredEmoji(emoji);
	}

	// Search Logic
	// This runs anytime the input value changes
	function handleChange(event) {
		// It goes into "search" mode if the input isn't blank
		// This is only used to change which emojis display and the header to "Search Results"
		setSearching(event.target.value === '' ? false : true);

		// Filter the emojis using the JSON description and first alias in the array from the JSON.
		// Notice I changed everything to uppercase to ignore case-sensitive
		const _filteredEmojis = data.filter(
			data =>
				data.description.toUpperCase().includes(event.target.value.toUpperCase()) ||
				data.aliases[0].toUpperCase().includes(event.target.value.toUpperCase())
		);

		// I'm now changing the original data state to match the filtered value
		// This is the beauty of react, anytime I change the state it will automatically
		// update and only show the matching emojis.
		setEmojis(_filteredEmojis);
	}

	// This is using the custom hook that checks for the scroll position every .1 seconds
	// Also referred to as "throttling", this improves performance for scroll events
	useInterval(() => {
		// Setting the state based on the scroll position
		setScrollPos(scrollerRef.current.scrollTop);
	}, 100);

	// Function used to jump to a scroll position. Used when you click on one of the icons in the header.
	function scrollTo(position) {
		scrollerRef.current.scrollTop = position;
	}

	// Function used when you mouse out to remove the emoji and description in the footer.
	function clearEmojis() {
		setDescription('');
		setHoveredEmoji('');
	}

	// Here, I'm mapping the data to all of the emojis. This is used when the search state is true.
	// I used this to get rid of the section headers and put all of the emojis in one group to keep things simple.
	let allEmojis = emojis.map((item, i) => (
		<EmojiCard
			category={item.category}
			description={item.description}
			emoji={item.emoji}
			onClick={() => handleClick(item.emoji)}
			onHover={() => handleHover(item.aliases[0], item.emoji)}
			isDarkMode={props.isDarkMode}
		/>
	));

	// Here's all the sections of the emojis I want to include
	const emojiTypes = [
		'People',
		'Nature',
		'Foods',
		'Activity',
		'Places',
		'Objects',
		'Symbols',
		'Flags'
	];
	let emojiSections = [];

	// This is very similar to the allEmojis above, except instead I'm grouping them.
	// I'm grouping all the emoji's with the same description and putting them inside
	// of a section.
	for (let i = 0; i < emojiTypes.length; i++) {
		const _filteredEmojiByCategory = emojis
			.filter(item => item.category === emojiTypes[i])
			.map((item, k) => (
				<EmojiCard
					category={item.category}
					description={item.description}
					emoji={item.emoji}
					onClick={() => handleClick(item.emoji)}
					onHover={() => handleHover(item.aliases[0], item.emoji)}
					isDarkMode={props.isDarkMode}
				/>
			));
		emojiSections[i] = emojiSection(emojiTypes[i], _filteredEmojiByCategory, props);
	}

	// Static variables
	const CardWidth = 340;
	const numberOfTabs = 8;
	const tabWidth = CardWidth / numberOfTabs;
	const sectionScrollPos = [0, 1583, 2452, 2943, 3392, 4052, 5004, 6462];

	// Function to give the emojis at the top.
	// They're functions because I want to pass a color depending on if it's light/dark mode
	// and if it's active/inactive
	const emojiIcons = color => {
		return [
			peopleIcon(color),
			natureIcon(color),
			foodIcon(color),
			activityIcon(color),
			placesIcon(color),
			objectIcon(color),
			symbolsIcon(color),
			flagsIcon(color)
		];
	};

	// Function used to create the tabs
	// The logic is basically just saying whether or not the scroll position is within the section.
	// So, if I'm within the "people" section, the people icon will light up.
	function createTabs() {
		let tabs = [];
		for (let i = 0; i < numberOfTabs; i++) {
			let isActive =
				i === 0
					? scrollPos < sectionScrollPos[i + 1] || scrollPos <= 0
						? true
						: false
					: i === numberOfTabs - 1
					? scrollPos >= sectionScrollPos[numberOfTabs - 1]
						? true
						: false
					: scrollPos >= sectionScrollPos[i] && scrollPos < sectionScrollPos[i + 1]
					? true
					: false;
			tabs.push(
				<div
					style={{
						width: '100%',
						maxWidth: 32,
						height: 44,
						alignItems: 'center',
						display: 'flex',
						justifyContent: 'center',
						cursor: 'pointer'
					}}
					onClick={() => scrollTo(sectionScrollPos[i])}>
					{emojiIcons(isActive ? colors.emojiEnabled : colors.emojiDisabled)[i]}
				</div>
			);
		}
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					padding: '0px  8px'
				}}>
				{tabs}
			</div>
		);
	}

	return (
		// There's many different examples of styling below.
		// I use inline styling, a function to style, calling the CSS className to style,
		// and also referencing a variable that I created below the component.
		<div
			// Here i'm extending the background variable instead of passing the prop into a function.
			// Only downside of this is added code to return section
			style={{ ...background, background: props.isDarkMode ? '#111' : 'white' }}
			onMouseLeave={clearEmojis}>
			{createTabs()}
			<input
				className={props.isDarkMode ? 'inputDark' : 'input'}
				type={'text'}
				spellCheck={false}
				placeholder={'Search'}
				onChange={event => handleChange(event)}
				style={input(props)}
			/>
			<Frame
				style={{
					position: 'absolute',
					height: 20,
					width: 20,
					top: 51,
					left: 16,
					background: null
				}}>
				{SearchIcon(props)}
			</Frame>
			<div
				ref={scrollerRef}
				style={{
					...container,
					background: props.isDarkMode ? '#111' : 'white'
				}}>
				{/* If the searching state is true, return the entire group of emojis filtered by the keyword */}
				{searching ? emojiSection('Search Results', allEmojis, props) : emojiSections}
			</div>
			{/* Here, you can see i'm passing the props to a function for styling  */}
			<div style={bottomSection(props)}>
				{hoveredEmoji === '' ? (
					<div
						style={{
							fontSize: 21,
							fontWeight: 600,
							color: props.isDarkMode ? '#CCC' : '#666',
							marginLeft: 12
						}}>
						Max Emoji™
					</div>
				) : (
					<div style={{ display: 'flex' }}>
						<span style={{ fontSize: 40 }}>{hoveredEmoji}</span>
						<span
							style={{
								alignSelf: 'center',
								fontSize: 14,
								marginLeft: 10,
								color: props.isDarkMode ? '#EEE' : '#222'
							}}>
							{description}
						</span>
					</div>
				)}
			</div>
			{/*  highlightBorder */}
			<div
				style={{
					width: '100%',
					height: '100%',
					pointerEvents: 'none',
					boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)',
					position: 'absolute',
					top: 0,
					borderRadius: 12
				}}
			/>
		</div>
	);
}

EmojiPicker.defaultProps = {
	onClick: () => null,
	onHover: () => null,
	isDarkMode: false,
	width: 352,
	height: 405
};

addPropertyControls(EmojiPicker, {
	isDarkMode: {
		type: ControlType.Boolean,
		title: 'Appearance',
		defaultValue: false,
		enabledTitle: 'Dark',
		disabledTitle: 'Light'
	}
});

// This is the custom hook. I found this from Dan Abramov
function useInterval(callback, delay) {
	const savedCallback: any = useRef();

	useEffect(() => {
		savedCallback.current = callback;
	});

	useEffect(() => {
		function tracker() {
			savedCallback.current();
		}

		let id = setInterval(tracker, delay);
		return () => clearInterval(id);
	}, [delay]);
}

// This is a function used to create the sections. Notice I nest everything I want so the code above can be cleaner.
function emojiSection(sectionTitle: string, emojis: JSX.Element[], props) {
	return (
		<div>
			<div className='section-header' style={sectionHeader(props)}>
				{sectionTitle}
			</div>
			<div style={style}>{emojis}</div>
		</div>
	);
}

// An example of using a function to determine the styling. It checks the props to see whether it's dark or light mode.
function sectionHeader(props) {
	return {
		fontSize: 18,
		fontWeight: 700,
		padding: '4px 16px',
		background: props.isDarkMode ? 'rgba(17,17,17,0.9)' : 'rgba(255,255,255,0.95)',
		color: props.isDarkMode ? '#EEE' : '#111',
		top: 0,
		marginLeft: -8
	};
}

const style: React.CSSProperties = {
	display: 'flex',
	flexWrap: 'wrap'
};

function input(props) {
	return {
		margin: '0px 8px',
		marginBottom: 8,
		width: 'calc(100% - 16px)',
		height: 30,
		fontSize: 14,
		paddingLeft: 30,
		borderRadius: 16,
		background: props.isDarkMode ? '#111' : 'white'
	};
}

function bottomSection(props) {
	return {
		display: 'flex',
		width: '100%',
		borderRadius: '0 0 12px 12px',
		height: 64,
		alignItems: 'center',
		paddingLeft: 8,
		background: props.isDarkMode ? '#222' : '#F5F5F5',
		color: '#444',
		borderTop: '0.5px solid rgba(0,0,0,0.1)'
	};
}

const container: React.CSSProperties = {
	height: 'calc(100% - 146px)',
	overflow: 'auto',
	paddingLeft: 8,
	paddingRight: 8
};

const background: React.CSSProperties = {
	height: 405,
	width: 352,
	boxShadow: '0px 10px 20px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.08)',
	borderRadius: 12,
	overflow: 'hidden'
};

// Making the icons as functions. This way I can reuse the SVG code and just change the fill
function SearchIcon(props) {
	return (
		<svg
			width='17'
			height='17'
			viewBox='0 0 17 17'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'>
			<path
				fill-rule='evenodd'
				clip-rule='evenodd'
				d='M11.726 12.1983C10.5408 13.1681 9.02587 13.75 7.375 13.75C3.57804 13.75 0.5 10.672 0.5 6.875C0.5 3.07804 3.57804 0 7.375 0C11.172 0 14.25 3.07804 14.25 6.875C14.25 8.52587 13.6681 10.0408 12.6983 11.226L16.7986 15.3264C17.0671 15.5948 17.0671 16.0302 16.7986 16.2986C16.5302 16.5671 16.0948 16.5671 15.8264 16.2986L11.726 12.1983ZM12.875 6.875C12.875 9.91257 10.4126 12.375 7.375 12.375C4.33743 12.375 1.875 9.91257 1.875 6.875C1.875 3.83743 4.33743 1.375 7.375 1.375C10.4126 1.375 12.875 3.83743 12.875 6.875Z'
				fill={props.isDarkMode ? '#666' : '#777'}
			/>
		</svg>
	);
}

function peopleIcon(fill = 'lightgrey') {
	return (
		<svg
			width='18'
			height='18'
			viewBox='0 0 18 18'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'>
			<path
				fill-rule='evenodd'
				clip-rule='evenodd'
				d='M16.5375 9C16.5375 13.1628 13.1628 16.5375 9 16.5375C4.83715 16.5375 1.4625 13.1628 1.4625 9C1.4625 4.83715 4.83715 1.4625 9 1.4625C13.1628 1.4625 16.5375 4.83715 16.5375 9ZM9 18C13.9706 18 18 13.9706 18 9C18 4.02944 13.9706 0 9 0C4.02944 0 0 4.02944 0 9C0 13.9706 4.02944 18 9 18ZM7 7.24999C7 7.94035 6.55228 8.49999 6 8.49999C5.44771 8.49999 5 7.94035 5 7.24999C5 6.55964 5.44771 5.99999 6 5.99999C6.55228 5.99999 7 6.55964 7 7.24999ZM12 8.49999C12.5523 8.49999 13 7.94035 13 7.24999C13 6.55964 12.5523 5.99999 12 5.99999C11.4477 5.99999 11 6.55964 11 7.24999C11 7.94035 11.4477 8.49999 12 8.49999ZM5.8018 12.8532C5.33025 12.4372 5 12.1458 5 11.5C5 11.5 5.01461 11.0027 5.97011 11.0027C6.28334 11.0027 6.93174 11.0021 7.69713 11.0014C9.26654 11 11.3278 10.9982 12 11C13 11.0027 13 11.5 13 11.5C13 12.1775 12.6083 12.557 12 13.0027C11.3917 13.4484 10.3041 14 9.00059 14C7.69711 14 6.52949 13.5058 5.97011 13.0027C5.91232 12.9507 5.85612 12.9012 5.8018 12.8532Z'
				fill={fill}
			/>
		</svg>
	);
}

function natureIcon(fill = 'lightgrey') {
	return (
		<svg
			width='20'
			height='18'
			viewBox='0 0 20 18'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'>
			<path
				d='M10.2893 12.5185H10.3164C10.5659 12.5185 10.8018 12.4069 10.9576 12.2152C11.2409 11.8667 11.1835 11.3582 10.8294 11.0794L10.3457 10.6985C9.92193 10.3649 9.31981 10.3649 8.89606 10.6985L8.41238 11.0794C8.2176 11.2327 8.10422 11.4649 8.10422 11.7104C8.10422 12.1567 8.47184 12.5185 8.92532 12.5185H8.95243V13.756C8.61534 13.7029 8.27601 13.6095 7.93362 13.4747C7.59447 13.3412 7.20533 13.5019 7.06675 13.8428C6.92722 14.1861 7.09867 14.5714 7.43997 14.7058C8.15993 14.9892 8.88805 15.1332 9.62057 15.1332C10.3531 15.1332 11.0812 14.9892 11.8012 14.7058C12.1425 14.5714 12.3139 14.1861 12.1744 13.8428C12.0358 13.5019 11.6467 13.3412 11.3075 13.4747C10.9653 13.6094 10.6262 13.7028 10.2893 13.7559V12.5185Z'
				fill={fill}
			/>
			<path
				d='M6.39059 9.58671C6.9563 9.58671 7.4149 9.13535 7.4149 8.57857C7.4149 8.02179 6.9563 7.57043 6.39059 7.57043C5.82488 7.57043 5.36627 8.02179 5.36627 8.57857C5.36627 9.13535 5.82488 9.58671 6.39059 9.58671Z'
				fill={fill}
			/>
			<path
				d='M12.5181 9.58671C13.0838 9.58671 13.5424 9.13535 13.5424 8.57857C13.5424 8.02179 13.0838 7.57043 12.5181 7.57043C11.9524 7.57043 11.4938 8.02179 11.4938 8.57857C11.4938 9.13535 11.9524 9.58671 12.5181 9.58671Z'
				fill={fill}
			/>
			<path
				fill-rule='evenodd'
				clip-rule='evenodd'
				d='M9.44763 0C8.29311 0 7.20102 0.278026 6.23903 0.771215C4.23122 -0.0322164 1.94258 0.435179 0.734657 2.16027C-0.403384 3.78556 -0.164269 5.93047 1.07288 7.52124C0.391692 8.50361 0.0067052 9.68218 0.0067052 10.9261C0.0067052 14.0964 2.48854 16.7021 5.65122 16.9467C6.04104 17.2152 6.58269 17.4153 7.19417 17.5519C7.85824 17.7002 8.63335 17.7799 9.44763 17.7799C10.2619 17.7799 11.037 17.7002 11.7011 17.5519C12.3126 17.4153 12.8542 17.2152 13.244 16.9467C16.4067 16.7021 18.8886 14.0964 18.8886 10.9261C18.8886 9.74434 18.5411 8.62155 17.9223 7.66996C19.2626 6.06621 19.5538 3.83709 18.38 2.16073C17.1476 0.400624 14.7901 -0.0502088 12.7537 0.82218C11.7683 0.297221 10.6413 0 9.44763 0ZM2.53831 6.0365C2.73478 4.4069 3.50883 2.95941 4.64879 1.89063C3.53851 1.76927 2.49541 2.17287 1.92207 2.99169C1.25912 3.93849 1.33265 5.2856 2.08922 6.39016C2.23268 6.26593 2.38249 6.14788 2.53831 6.0365ZM17.1926 2.99216C17.8796 3.97333 17.7757 5.38442 16.9403 6.50996C16.7568 6.34134 16.5621 6.18314 16.3569 6.0365C16.1621 4.42034 15.3991 2.98328 14.2746 1.91712C15.4552 1.72488 16.5864 2.12645 17.1926 2.99216ZM9.44763 1.49052C6.56249 1.49052 4.18747 3.69769 4.00426 6.50432L3.97952 6.88341L3.65554 7.08628C2.32769 7.91774 1.51029 9.35387 1.51029 10.9261C1.51029 13.3687 3.47549 15.3796 5.95961 15.4716L6.2426 15.4821L6.44829 15.6751C6.58803 15.8062 6.94226 15.9676 7.50231 16.0929C8.04287 16.2139 8.72014 16.2894 9.44763 16.2894C10.1751 16.2894 10.8524 16.2139 11.3929 16.0929C11.953 15.9676 12.3072 15.8062 12.447 15.6751L12.6527 15.4821L12.9356 15.4716C15.4198 15.3796 17.385 13.3687 17.385 10.9261C17.385 9.35387 16.5676 7.91774 15.2397 7.08628L14.9157 6.88341L14.891 6.50432C14.7078 3.69769 12.3328 1.49052 9.44763 1.49052Z'
				fill={fill}
			/>
		</svg>
	);
}

function foodIcon(fill = 'lightgrey') {
	return (
		<svg
			width='19'
			height='17'
			viewBox='0 0 19 17'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'>
			<path
				fill-rule='evenodd'
				clip-rule='evenodd'
				d='M9.28257 0C4.85586 0 1.1744 3.16762 0.968216 7.26127C0.379228 7.70319 0 8.47829 0 9.34811V10.4834C0 11.3911 0.411986 12.1929 1.04227 12.6232L1.49205 14.2361C1.82602 15.4337 2.90994 16.3921 4.00568 16.3921H14.5595C15.651 16.3921 16.7404 15.4291 17.0731 14.2361L17.5228 12.6233C18.154 12.1922 18.5651 11.3888 18.5651 10.4834V9.34811C18.5651 8.47617 18.1851 7.70247 17.5969 7.26132C17.3908 3.16765 13.7093 0 9.28257 0ZM9.28257 1.48815C12.9093 1.48815 15.8336 3.88837 16.2533 6.87875H2.31182C2.73152 3.88837 5.65581 1.48815 9.28257 1.48815ZM1.30082 9.34811C1.30082 8.77265 1.67982 8.3669 2.08663 8.3669H10.9224L13.1285 11.0039C13.2523 11.1519 13.4218 11.233 13.5986 11.233C13.7755 11.233 13.945 11.1519 14.0688 11.0039L16.2749 8.3669H16.4785C16.8851 8.3669 17.2643 8.77195 17.2643 9.34811V10.4834C17.2643 11.0588 16.8853 11.4646 16.4785 11.4646H2.08663C1.68006 11.4646 1.30082 11.0595 1.30082 10.4834V9.34811ZM13.6013 9.41527L12.7243 8.3669H14.476L13.6013 9.41527ZM2.73109 13.7818L2.4999 12.9527H16.0652L15.834 13.7818C15.7509 14.08 15.5579 14.364 15.3162 14.5732C15.0729 14.7839 14.798 14.904 14.5595 14.904H4.00568C3.7646 14.904 3.49 14.7846 3.24785 14.575C3.00723 14.3666 2.81502 14.0827 2.73109 13.7818Z'
				fill={fill}
			/>
		</svg>
	);
}

function activityIcon(fill = 'lightgrey') {
	return (
		<svg
			width='18'
			height='18'
			viewBox='0 0 18 18'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'>
			<path
				fill-rule='evenodd'
				clip-rule='evenodd'
				d='M15.3052 2.61657C13.5991 0.910552 11.3479 -0.0216046 8.96033 0.000380198C6.57278 -0.0216046 4.32154 0.910552 2.61551 2.61657C0.909491 4.3226 -0.0226654 6.57384 0.000418703 8.96139C0.000418703 11.3709 0.932575 13.6222 2.61551 15.3062C4.29845 16.9881 6.57278 17.9444 8.96033 17.9202C11.371 17.9202 13.6222 16.9881 15.3052 15.3062C16.9881 13.6222 17.9433 11.3489 17.9202 8.96139C17.9433 6.57384 17.0112 4.3226 15.3052 2.61657ZM3.32123 14.1014L3.27506 14.1476C2.11536 12.8967 1.43273 11.305 1.29642 9.62094L8.32387 9.59895V11.4171C6.34524 11.5776 4.54908 12.5559 3.32123 14.1014ZM8.32277 12.7362C6.75416 12.8967 5.29876 13.6683 4.32044 14.9193L4.2303 15.0116C5.41198 15.9196 6.82231 16.467 8.32277 16.6033V12.7362ZM9.59679 9.59895H16.6012C16.4418 11.3951 15.691 13.011 14.5093 14.2378C13.3034 12.668 11.5304 11.6677 9.57371 11.4413L9.59679 9.59895ZM9.59679 8.32383H16.6012C16.4649 6.50569 15.691 4.82165 14.395 3.52675L14.2818 3.41242L14.2136 3.48058C13.0308 4.84584 11.371 5.68566 9.59679 5.86813V8.32383ZM9.59679 1.31947C10.939 1.43379 12.1899 1.86469 13.2584 2.61438L13.2353 2.63856C12.28 3.72901 11.0071 4.41273 9.59679 4.59301V1.31947ZM8.32277 4.59521V1.31947C6.91355 1.41181 5.63953 1.91086 4.54798 2.68473C5.5263 3.75319 6.86738 4.4589 8.32277 4.59521ZM3.54767 3.50256C3.60593 3.55972 3.6521 3.61688 3.69717 3.67404C3.74224 3.7312 3.7873 3.78617 3.84337 3.84333C5.02615 5.02611 6.61785 5.75381 8.30079 5.89011V8.29965L1.31951 8.32383C1.4789 6.43534 2.29673 4.7535 3.54767 3.50256ZM9.59679 12.7362V16.6011C11.0753 16.4868 12.4394 15.9416 13.576 15.0776L13.5541 15.0556C12.5988 13.7805 11.1654 12.9406 9.59679 12.7362Z'
				fill={fill}
			/>
		</svg>
	);
}

function placesIcon(fill = 'lightgrey') {
	return (
		<svg
			width='19'
			height='19'
			viewBox='0 0 19 19'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'>
			<path
				fill-rule='evenodd'
				clip-rule='evenodd'
				d='M4.54369 10.4469L1.92291 10.0066L1.92073 10.0063C1.4362 9.92978 0.924676 10.0821 0.564715 10.4421L0.455088 10.5517C0.0951277 10.9117 -0.0572231 11.4232 0.0192816 11.9077C0.0969102 12.3994 0.430637 12.8352 0.893104 13.0417L3.84659 14.4329L5.28061 17.2795C5.50965 17.7373 5.93795 18.0389 6.41088 18.1417C6.50927 18.1711 6.62105 18.1709 6.6778 18.1708L6.68735 18.1708C7.09012 18.1708 7.50288 18.0205 7.79249 17.7068C8.14475 17.3525 8.32584 16.8425 8.22393 16.3267L7.78445 13.7317L10.622 11.1323L13.5943 16.3442C13.8231 16.774 14.2316 17.0822 14.7209 17.1594C15.2081 17.2364 15.6969 17.0817 16.055 16.7236L16.0988 16.6798C16.46 16.3186 16.6134 15.7814 16.5109 15.2921L14.9093 7.17556L17.5757 3.93316C18.3906 3.1105 18.4897 1.80506 17.7836 0.903476C17.371 0.369832 16.7638 0.0545708 16.11 0.00613771C15.4548 -0.0423917 14.8247 0.198967 14.3638 0.655433L11.1214 3.32184L3.02576 1.72002C2.5149 1.61794 1.97806 1.77142 1.59521 2.15427C1.23546 2.51401 1.08308 3.02515 1.15927 3.50942C1.23617 4.02028 1.54427 4.43066 1.9987 4.66001L7.16378 7.6085L4.54369 10.4469ZM4.93703 13.6139C4.87143 13.4827 4.77039 13.3817 4.6392 13.3161L1.4578 11.824C1.3878 11.7884 1.35129 11.7389 1.3408 11.6655C1.32887 11.582 1.34918 11.5211 1.40878 11.4615L1.51841 11.3519C1.56531 11.305 1.61831 11.2862 1.66646 11.2862H1.71336L4.65338 11.7834C4.90727 11.8772 5.14718 11.7627 5.27884 11.6031L8.6919 7.88377C8.83423 7.73845 8.8925 7.51152 8.86043 7.31908C8.82574 7.11094 8.69028 6.94937 8.53516 6.85629L2.58065 3.49166H2.56371C2.52181 3.45762 2.48314 3.40113 2.45724 3.31926C2.44889 3.23396 2.47565 3.15925 2.52698 3.10792C2.57701 3.0579 2.65439 3.02653 2.77172 3.03963L11.1829 4.68252L11.189 4.68354C11.3698 4.71367 11.5696 4.68524 11.7391 4.54968L15.302 1.60257L15.3315 1.57314C15.5286 1.37595 15.7952 1.26995 16.0794 1.28772C16.3605 1.30529 16.6121 1.4455 16.7967 1.66649C17.0871 2.02652 17.0462 2.59563 16.6619 2.96162L16.6285 2.99503L13.7275 6.51138L13.7254 6.51402C13.5898 6.68347 13.5613 6.88335 13.5914 7.06411L15.2577 15.4835C15.2673 15.5589 15.2502 15.6219 15.2095 15.6805L15.1345 15.7368L15.1233 15.748C15.0589 15.8124 14.9984 15.8255 14.9464 15.8168C14.894 15.8081 14.8407 15.7771 14.8053 15.7334V15.7157L11.3772 9.722L11.3748 9.71798C11.2817 9.56286 11.1202 9.42736 10.9121 9.39267C10.705 9.35815 10.5103 9.4292 10.3617 9.54808L6.623 12.9786L6.61618 12.9854C6.45653 13.1451 6.389 13.3473 6.42093 13.5708L6.94772 16.534C6.95967 16.624 6.93286 16.703 6.87928 16.7566C6.82505 16.8108 6.74473 16.8377 6.65339 16.8246C6.56883 16.8125 6.50928 16.7689 6.47772 16.6953L4.93703 13.6139ZM8.54867 7.70727C8.54243 7.7148 8.5359 7.72197 8.52912 7.72875Z'
				fill={fill}
			/>
		</svg>
	);
}

function objectIcon(fill = 'lightgrey') {
	return (
		<svg
			width='15'
			height='19'
			viewBox='0 0 15 19'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'>
			<path
				fill-rule='evenodd'
				clip-rule='evenodd'
				d='M11.1493 14.8411V13.3582C13.0308 12.1276 14.1886 9.98789 14.1886 7.71191C14.1886 4.01051 11.2309 1 7.59432 1C3.95777 1 1 4.01051 1 7.71191C1 10.0252 2.18499 12.1819 4.10838 13.404V14.8401C4.10838 15.5746 4.69512 16.1718 5.41678 16.1718H9.83984C10.5625 16.1739 11.1493 15.5757 11.1493 14.8411ZM10.2728 13.1102V14.8422C10.2728 15.0849 10.0793 15.2818 9.84088 15.2818H5.41783C5.17937 15.2818 4.98588 15.0849 4.98588 14.8422V13.1528C4.98588 12.9931 4.90116 12.8451 4.76519 12.7653C2.983 11.7295 1.87645 9.79308 1.87645 7.71298C1.87645 4.50446 4.44097 1.89315 7.59432 1.89315C10.7466 1.89315 13.3122 4.50339 13.3122 7.71298C13.3122 9.76008 12.2307 11.6805 10.4883 12.7259C10.3544 12.8057 10.2728 12.9516 10.2728 13.1102Z'
				fill={fill}
			/>
			<path
				d='M5.34164 17.704C5.03061 17.704 4.77847 17.9561 4.77847 18.2671C4.77847 18.5782 5.03061 18.8303 5.34164 18.8303H9.847C10.158 18.8303 10.4102 18.5782 10.4102 18.2671C10.4102 17.9561 10.158 17.704 9.847 17.704H5.34164Z'
				fill={fill}
			/>
			<path
				fill-rule='evenodd'
				clip-rule='evenodd'
				d='M11.1493 14.8411V13.3582C13.0308 12.1276 14.1886 9.98789 14.1886 7.71191C14.1886 4.01051 11.2309 1 7.59432 1C3.95777 1 1 4.01051 1 7.71191C1 10.0252 2.18499 12.1819 4.10838 13.404V14.8401C4.10838 15.5746 4.69512 16.1718 5.41678 16.1718H9.83984C10.5625 16.1739 11.1493 15.5757 11.1493 14.8411ZM10.2728 13.1102V14.8422C10.2728 15.0849 10.0793 15.2818 9.84088 15.2818H5.41783C5.17937 15.2818 4.98588 15.0849 4.98588 14.8422V13.1528C4.98588 12.9931 4.90116 12.8451 4.76519 12.7653C2.983 11.7295 1.87645 9.79308 1.87645 7.71298C1.87645 4.50446 4.44097 1.89315 7.59432 1.89315C10.7466 1.89315 13.3122 4.50339 13.3122 7.71298C13.3122 9.76008 12.2307 11.6805 10.4883 12.7259C10.3544 12.8057 10.2728 12.9516 10.2728 13.1102Z'
				stroke={fill}
				stroke-width='0.337902'
			/>
			<path
				d='M5.34164 17.704C5.03061 17.704 4.77847 17.9561 4.77847 18.2671C4.77847 18.5782 5.03061 18.8303 5.34164 18.8303H9.847C10.158 18.8303 10.4102 18.5782 10.4102 18.2671C10.4102 17.9561 10.158 17.704 9.847 17.704H5.34164Z'
				stroke={fill}
				stroke-width='0.337902'
			/>
		</svg>
	);
}

function symbolsIcon(fill = 'lightgrey') {
	return (
		<svg
			width='19'
			height='19'
			viewBox='0 0 19 19'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'>
			<path
				fill-rule='evenodd'
				clip-rule='evenodd'
				d='M15.1206 7.61504C14.1725 7.20406 13.2871 7.19421 12.4818 7.37644C13.1378 6.6517 13.5155 5.70059 13.4564 4.66568C13.3439 2.69337 11.5858 1.07836 9.47131 1.0029C7.10281 0.918499 5.15419 2.68532 5.15419 4.87713C5.15419 5.83003 5.52391 6.70121 6.13489 7.37644C5.32962 7.19421 4.44414 7.20406 3.49604 7.61504C2.03665 8.24792 1.02112 9.58735 1.00035 11.089C0.970631 13.254 2.8416 15.0175 5.15419 15.0175C6.27165 15.0175 7.28367 14.6039 8.03014 13.934V15.0763C8.03014 15.6242 7.87708 16.1625 7.58565 16.6382L7.02515 17.5538C6.90341 17.7528 7.05743 18 7.30252 18H11.3142C11.5596 18 11.7133 17.7528 11.5915 17.5538L11.031 16.6382C10.7399 16.1625 10.5865 15.6242 10.5865 15.0763V13.934C11.3333 14.6039 12.3454 15.0175 13.4625 15.0175C15.7751 15.0175 17.6464 13.254 17.6163 11.089C17.5956 9.58735 16.58 8.24792 15.1206 7.61504V7.61504Z'
				stroke={fill}
				stroke-width='1.24667'
			/>
		</svg>
	);
}

function flagsIcon(fill = 'lightgrey') {
	return (
		<svg
			width='13'
			height='18'
			viewBox='0 0 13 18'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'>
			<path
				fill-rule='evenodd'
				clip-rule='evenodd'
				d='M12.1527 1.65334C12.3381 1.62667 12.5499 1.65334 12.7088 1.78667C12.8676 1.92001 12.9735 2.10667 13 2.32001V10.9216C13 11.2149 12.7882 11.4816 12.4969 11.5616L11.1202 11.9083C10.4318 12.0949 9.7169 12.1749 9.02851 12.1749C8.0224 12.1749 7.01629 11.9883 6.06314 11.6416L6.01018 11.6149C4.76578 11.1349 3.41548 11.0283 2.09165 11.2949L1.32383 11.4549V17.3333C1.32383 17.7067 1.03259 18 0.661914 18C0.291242 18 0 17.7067 0 17.3333V1.33334C0 0.960005 0.291242 0.666672 0.661914 0.666672C1.03259 0.666672 1.32383 0.960005 1.32383 1.33334V1.49334L1.85336 1.38667C3.389 1.09334 5.00407 1.20001 6.51324 1.76001C7.89002 2.26667 9.37271 2.34667 10.776 2.00001L12.1527 1.65334ZM10.776 10.6016L11.6497 10.3883V3.14667L11.0937 3.28001C9.42566 3.70667 7.67821 3.60001 6.06314 3.01334L6.01018 2.98667C4.76578 2.53334 3.41548 2.42667 2.09165 2.69334L1.32383 2.85334V10.0949L1.85336 9.98826C2.40937 9.88159 2.96538 9.82826 3.52139 9.82826C4.52749 9.82826 5.53361 10.0149 6.51324 10.3616C7.89002 10.8683 9.37271 10.9483 10.776 10.6016Z'
				fill={fill}
			/>
		</svg>
	);
}
