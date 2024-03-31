// import  React from "react";
import styles from "./App.module.css";
import { InputWithLabel } from "./InputWithLabel";

// eslint-disable-next-line react/prop-types
const SearchForm = ({ onSearchSubmit, searchTerm, onSearchInput }) => (
	<form onSubmit={onSearchSubmit} className={styles.searchForm}>
		<InputWithLabel
			value="text"
			onInputChange={onSearchInput}
			search={searchTerm}
			isFocused={true}
			id="search"
		>
			Search:
		</InputWithLabel>
		<button
			type="button"
			disabled={!searchTerm}
			className={`${styles.button} ${styles.buttonLarge}`}
		>
			Submit
		</button>
	</form>
);
export { SearchForm };
