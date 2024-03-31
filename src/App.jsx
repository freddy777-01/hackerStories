/* eslint-disable react/prop-types */
import React from "react";
import axios from "axios";
import styles from "./App.module.css";
import { SearchForm } from "./SearchForm";
import { List } from "./List";

// eslint-disable-next-line no-unused-vars
const title = "Reaction";
// eslint-disable-next-line no-unused-vars

const useStorageState = (key, initialState) => {
	const [value, setValue] = React.useState(
		localStorage.getItem(key) || initialState
	);
	const isMountend = React.useRef(false);
	React.useEffect(() => {
		if (!isMountend.current) {
			isMountend.current = true;
		} else {
			localStorage.setItem(key, value);
		}
	}, [value, key]);

	return [value, setValue];
};

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";

const API_BASE = "http://hn.alglia.com/api/v1";
const API_SEARCH = "/search";
const PARAM_SEARCH = "query=";
const PARAM_PAGE = "page=";
/* new Promise((resolve) => {
	setTimeout(() => resolve({ data: { stories: initialStories } }), 2000);
}); */

const storiesReducer = (state, action) => {
	switch (action.type) {
		case "STORIES_FETCH_INIT":
			return {
				...state,
				isLoading: true,
				isError: false,
			};
		case "STORIES_FETCH_SUCCESS":
			return {
				...state,
				isLoading: false,
				isError: false,
				data:
					action.payload.page === 0
						? action.payload.list
						: state.data.concat(action.payload.list),
				page: action.payload.page,
			};
		case "STORIES_FETCH_FAILURE":
			return {
				...state,
				isLoading: false,
				isError: true,
			};
		case "REMOVE_STORY":
			return {
				...state,
				data: state.data.filter(
					(story) => action.payload.objectID !== story.objectID
				),
			};
		default:
			throw new Error();
	}
};

const getSumComments = (stories) => {
	return stories.data.reduce((result, value) => result + value.num_comments, 0);
};

// const extractSearchTerm = (url) => url.replace(API_ENDPOINT, "");
const extractSearchTerm = (url) =>
	url
		.substring(url.lastIndexOf("?") + 1, url.lastIndexOf("&"))
		.replace(PARAM_SEARCH, "");
// const getLastSearches = (urls) => urls.slice(-5).map((url) => extractSearchTerm(url));
const getLastSearches = (urls) =>
	urls
		.reduce((result, url, index) => {
			const searchTerm = extractSearchTerm(url);

			if (index === 0) {
				return result.concat(searchTerm);
			}
			const previousSearchTerm = result[result.length - 1];
			if (searchTerm === previousSearchTerm) {
				return result;
			} else {
				return result.concat(searchTerm);
			}
		}, [])
		.slice(-6)
		.slice(0, -1)
		.map(extractSearchTerm);

const getUrl = (searchTerm, page) =>
	`${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`;

function App() {
	const [searchTerm, setSearchTerm] = useStorageState("search", "React");

	const [urls, setUrls] = React.useState([getUrl(searchTerm, 0)]);

	const handleSearch = (searchTerm, page) => {
		const url = getUrl(searchTerm, page);
		setUrls(urls.concat(url));
	};
	const handleSearchSubmit = (event) => {
		// const url = `${API_ENDPOINT}${searchTerm}`;
		// setUrls(urls.concat(url));
		handleSearch(searchTerm, 0);
		event.preventDefault();
	};

	const handleLastSearch = (searchTerm) => {
		setSearchTerm;
		handleSearch(searchTerm, 0);
	};
	const handleSearhInput = (event) => {
		// console.log(event.target.value);
		setSearchTerm(event.target.value);
	};

	const [stories, dispatchStories] = React.useReducer(storiesReducer, {
		data: [],
		page: 0,
		isLoading: false,
		isError: false,
	});
	// const [stories, setStories] = React.useState([]);

	const handleFetchStories = React.useCallback(async () => {
		// if (!searchTerm) return;

		dispatchStories({ type: "STORIES_FETCH_INIT" });

		try {
			const lastUrl = urls[urls.length - 1];
			const result = await axios.get(urls);

			dispatchStories({
				type: "STORIES_FETCH_SUCCESS",
				payload: { list: result.data.hits, page: result.data.page },
			});
		} catch {
			dispatchStories({ type: "STORIES_FETCH_FAILURE" });
		}
	}, [urls]);

	React.useEffect(() => {
		console.log("How many times do you want to log me ?");
		handleFetchStories();
	}, [handleFetchStories]);

	const handleRemoveStory = React.useCallback((item) => {
		dispatchStories({
			type: "REMOVE_STORY",
			payload: item,
		});
	}, []);

	const sumComments = React.useMemo(() => getSumComments(stories), [stories]);

	const lastSearches = getLastSearches(urls);
	const handleMore = () => {
		const lastUrl = urls[urls.lenght - 1];
		const searchTerm = extractSearchTerm(lastUrl);
		handleSearch(searchTerm, stories.page + 1);
	};
	return (
		<div className={styles.container}>
			<h1 className={styles.headlinePrimary}>{title}</h1>
			<h2>My Hacker Stories with {sumComments} comments.</h2>
			<SearchForm
				onSearchSubmit={handleSearchSubmit}
				searchTerm={searchTerm}
				onSearchInput={handleSearhInput}
			/>
			<LastSearches
				lastSearches={lastSearches}
				onLastSearch={handleLastSearch}
			/>
			<p>
				Searching for: <strong>{searchTerm}</strong>
			</p>
			{stories.isError && <p>Something went wrong ...</p>}
			{stories.isLoading ? (
				<p>Loading...</p>
			) : (
				<List list={stories.data} onRemoveItem={handleRemoveStory} />
			)}
			{stories.isLoading ? (
				<p>Loading...</p>
			) : (
				<button type="button" onClick={handleMore}>
					More
				</button>
			)}
		</div>
	);
}
const LastSearches = ({ lastSearches, onLastSearch }) => (
	<>
		{lastSearches.map((searchTerm, index) => (
			<button
				key={searchTerm + index}
				type="button"
				onClick={() => onLastSearch(searchTerm)}
			>
				{searchTerm}
			</button>
		))}
	</>
);

export default App;
// eslint-disable-next-line react-refresh/only-export-components
export { storiesReducer, SearchForm, List };
