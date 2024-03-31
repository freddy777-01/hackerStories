// import React from "react";
import styles from "./App.module.css";
import { ReactComponent as Check } from "./check.svg";
import React from "react";
import { sortBy } from "lodash";

const SORTS = {
	NONE: (list) => list,
	TITLE: (list) => sortBy(list, "title"),
	AUTHOR: (list) => sortBy(list, "num_comments").reverse(),
	POINT: (list) => sortBy(list, "points").reverse(),
};
// eslint-disable-next-line react/prop-types
const List = ({ list, onRemoveItem }) => {
	const [sort, setSort] = React.useState({
		sortKey: "NONE",
		isReverse: false,
	});

	const handleSort = (sortKey) => {
		const isReverse = sort.sortKey === sortKey && !sort.isReverse;
		setSort({ sortKey, isReverse });
	};

	const sortFunction = SORTS[sort.sortKey];
	const sortedList = sort.isReverse
		? sortFunction(list).reverse()
		: sortFunction(list);

	return (
		<ul>
			<li style={{ display: "flex" }}>
				<span style={{ width: "40%" }} onClick={() => handleSort("TITLE")}>
					Title
				</span>
				<span style={{ width: "30%" }} onClick={() => handleSort("AUTHOR")}>
					Author
				</span>
				<span style={{ width: "10%" }} onClick={() => handleSort("COMMENT")}>
					Comments
				</span>
				<span style={{ width: "10%" }} onClick={() => handleSort("POINT")}>
					Points
				</span>
				<span style={{ width: "10%" }}>Actions</span>
			</li>
			{/* eslint-disable-next-line react/prop-types */}
			{sortedList.map((item) => (
				<Item item={item} key={item.objectID} onRemoveItem={onRemoveItem} />
			))}
		</ul>
	);
};

// eslint-disable-next-line react/prop-types
const Item = ({ item, onRemoveItem }) => {
	return (
		<li className={styles.item}>
			<span style={{ width: "40%" }}>
				{/*eslint-disable-next-line react/prop-types*/}
				<a href={item.url}>{item.title}</a>
			</span>
			{/*eslint-disable-next-line react/prop-types*/}
			<span style={{ width: "30%" }}>Author: {item.author}</span>
			{/* eslint-disable-next-line react/prop-types */}
			<span style={{ width: "10%" }}>comments: {item.num_comments}</span>
			{/* eslint-disable-next-line react/prop-types */}
			<span style={{ width: "10%" }}>Pints: {item.points}</span>
			<span style={{ width: "10%" }}>
				<button
					type="button"
					onClick={() => onRemoveItem(item)}
					className={`${styles.button} ${styles.buttonSmall}`}
				>
					<Check height="18px" width="18px" />
				</button>
			</span>
		</li>
	);
};

export { List };
