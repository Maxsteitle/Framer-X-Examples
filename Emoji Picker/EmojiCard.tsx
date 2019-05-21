import * as React from 'react';
import { useState, useEffect } from 'react';

// This is the nested component used for each Emoji Card

// Notice the handleClick, handleHover event that's also used in EmojiPicker.tsx
// This is used to "lift the state"

// useEffect is run at the very beginning to choose a random CSS class
// and apply as the background color on hover. Every time you reload the
// background will have a new color.

function EmojiCards(props) {
	const [variation, setVariation] = useState('');

	function handleClick() {
		const { onClick } = props;
		onClick && onClick(props.emoji);
	}

	function handleHover() {
		const { onHover } = props;
		onHover && onHover(props.category);
	}

	useEffect(() => {
		const variation = props.isDarkMode ? darkVersions : versions;
		setVariation(variation[Math.floor(Math.random() * variation.length)]);
	}, []);

	return (
		<div
			style={style}
			className={variation}
			onMouseEnter={handleHover}
			onClick={handleClick}>
			{props.emoji}
		</div>
	);
}

// I can use events as props

EmojiCards.defaultProps = {
	emoji: '🤔',
	category: 'i am emoji',
	description: 'emoji',
	isDarkMode: false,
	onClick: () => null,
	onHover: () => null
};

// These are my CSS classes it randomly chooses from

const versions = ['card v1', 'card v2', 'card v3', 'card v4'];
const darkVersions = ['card v5', 'card v6', 'card v7', 'card v8'];

const style: React.CSSProperties = {
	height: 40,
	width: 40,
	textAlign: 'center',
	alignItems: 'center',
	justifyContent: 'center',
	borderRadius: 8,
	fontSize: 24,
	display: 'flex',
	margin: 1,
	cursor: 'pointer'
};

export const EmojiCard = EmojiCards;
