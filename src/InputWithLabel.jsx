/* eslint-disable react/prop-types */
import React from "react";
import styles from "./App.module.css";

const InputWithLabel = ({
	search,
	onInputChange,
	isFocused,
	children,
	id,
	value,
}) => {
	const inputRef = React.useRef(null);

	React.useEffect(() => {
		if (isFocused && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isFocused]);

	return (
		<div>
			<label htmlFor={id}>{children} </label>
			<input
				type={value}
				value={search}
				name="search"
				id={id}
				onChange={onInputChange}
				ref={inputRef}
				className={styles.input}
			/>
		</div>
	);
};

export { InputWithLabel };
