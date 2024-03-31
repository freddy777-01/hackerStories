import { describe, it, expect, vi } from "vitest";
import {
	storiesReducer,
	Item,
	List,
	SearchForm,
	InputWithLabel,
	App,
} from "./App";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";

vi.mock("axios");

const storyOne = {
	title: "React",
	url: "https://reactjs.org/",
	author: "Jordan Walke",
	num_comments: 3,
	points: 4,
	objectID: 0,
};
const storyTwo = {
	title: "Redux",
	url: "https://redux.js.org/",
	author: "Dan Abramov, Andrew Clark",
	num_comments: 2,
	points: 5,
	objectID: 1,
};
const stories = [storyOne, storyTwo];

describe("storiesReducer", () => {
	it("remove a story from all stories", () => {
		const action = { type: "REMOVE_STORY", payload: storyOne };
		const state = { data: stories, isLoading: false, isError: false };

		const newState = storiesReducer(state, action);

		const expectedState = {
			data: [storyTwo],
			isLoading: false,
			isError: false,
		};
		expect(newState).toStrictEqual(expectedState);
	});
});

describe("Item", () => {
	it("reanders all properties", () => {
		render(<Item item={storyOne} />);

		expect(screen.getByText("Jordan Walke")).toBeInTheDocument();
		expect(screen.getByText("React")).toHaveAttribute(
			"href",
			"https://reactjs.org/"
		);

		screen.debug();
	});

	it("renders a clickable dismiss button", () => {
		render(<Item item={storyOne} />);

		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("clicking the dismiss button calls the callback handler", () => {
		const handleRemoveItem = vi.fn();
		render(<Item item={storyOne} onRemoveItem={handleRemoveItem} />);
		fireEvent.click(screen.getByRole("button"));
		expect(handleRemoveItem).toHaveBeenCalledTimes(1);
	});
});

describe("SearchForm", () => {
	const searchFormProps = {
		searchTerm: "React",
		onSearchInput: vi.fn(),
		onSearchSubmit: vi.fn(),
	};

	it("calls onSearchInput on input field change", () => {
		render(<SearchForm {...searchFormProps} />);
		fireEvent.change(screen.getByDisplayValue("React"), {
			target: { value: "React" },
		});
	});
	it("calls onSearchSubmit on button submit click", () => {
		render(<SearchForm {...searchFormProps} />);
		fireEvent.submit(screen.getByRole("button"));
	});
	it("renders the input field with its value", () => {
		render(<SearchForm {...searchFormProps} />);
		// screen.debug();
		expect(screen.getByDisplayValue("React")).toBeInTheDocument();
	});

	it("renders the correct label", () => {
		render(<SearchForm {...searchFormProps} />);
		expect(screen.getByLabelText(/Search/)).toBeInTheDocument();
	});
});

describe("App", () => {
	it("succeeds fetching date", async () => {
		const promise = Promise.resolve({
			data: {
				hits: stories,
			},
		});

		axios.get.mockImplementationOnce(() => promise);
		render(<App />);

		expect(screen.queryByText(/Loading/)).toBeInTheDocument();
		await waitFor(async () => await promise);
		expect(screen.queryByText(/Loading/)).toBeNull();

		expect(screen.getByText("React")).toBeInTheDocument();
		expect(screen.getByText("Redux")).toBeInTheDocument();
		expect(screen.getAllByText("Dismiss").length).toBe(2);
	});

	it("fails fetching data", async () => {
		const promise = Promise.reject();

		axios.get.mockImplementationOnce(() => promise);

		render(<App />);

		expect(screen.getByText(/Loading/)).toBeInTheDocument();

		try {
			await waitFor(async () => await promise);
		} catch (error) {
			expect(screen.queryByText(/Loading/)).toBeNull();
			expect(screen.queryByText(/went wrong/)).toBeInTheDocument();
		}
	});

	it("remove a story", async () => {
		const promise = Promise.resolve({
			data: {
				hits: stories,
			},
		});
		axios.get.mockImplementationOnce(() => promise);
		render(<App />);
		await waitFor(async () => await promise);

		expect(screen.getAllByText("Dismiss").length).toBe(2);
		expect(screen.getByText("Jordan Walke")).toBeInTheDocument();

		fireEvent.click(screen.getAllByText("Dismiss")[0]);

		expect(screen.getAllByText("Dismiss").length).toBe(1);
		expect(screen.queryByText("jordan Walke")).toBeNull();
	});

	it("search for a specific stories", async () => {
		const reactPromise = Promise.resolve({
			data: {
				hits: stories,
			},
		});

		const anotherStory = {
			title: "JavaScript",
			url: "https://en.wikipedia.org/wiki/JavaScript",
			author: "Brendan Eich",
			num_comments: 15,
			points: 10,
			objectID: 3,
		};

		const javascriptPromise = Promise.resolve({
			data: {
				hists: [anotherStory],
			},
		});
		axios.get.mockImplementation((url) => {
			if (url.includes("React")) {
				return reactPromise;
			}
			if (url.includes("javaScript")) {
				return javascriptPromise;
			}
			throw Error();
		});

		// INitial Render
		render(<App />);
		//First Data Fetching
		await waitFor(async () => await reactPromise);

		expect(screen.queryByDisplayValue("React")).toBeInTheDocument();
		expect(screen.queryByDisplayValue("JavaScript")).toBeNull();

		expect(screen.queryByText("Jordan Walke")).toBeInTheDocument();

		expect(screen.queryByText("Dan Abramov, Andrew Clark")).toBeInTheDocument();
		expect(screen.queryByText("Brendan Eich")).toBeNull();

		// User Interaction-> Search
		fireEvent.change(screen.queryByDisplayValue("React"), {
			target: {
				value: "JavaScript",
			},
		});

		expect(screen.querybyDisplayValue("React")).toBeNull();
		expect(screen.queryByDisplayValue("JavaScript")).toBeInTheDocument();

		fireEvent.submit(screen.queryByText("Submit"));

		// Second Data Fetching

		await waitFor(async () => await javascriptPromise);

		expect(screen.queryByText("Jordan Walke")).toBeNull();
		expect(screen.queryByText("Dan Abramov, Andreq Clark")).toBeNull();
		expect(screen.queryByText("Brendan Eich")).toBeInTheDocument();
	});
});

describe("SearchForm", () => {
	it("renders snapshot", () => {
		const { container } = render(<SearchForm {...searchFormProps} />);
		expect(container.firstChild).toMatchSnapshot();
	});
});
/* describe("something truthy and falsy", () => {
	it("true to be true", () => {
		expect(true).toBe(true);
	});
	it("false to be false", () => {
		expect(false).toBe(false);
	});
}); */

/* it("true to be true", () => {
	expect(true).toBe(true);
});

it("false to be false", () => {
	expect(false).toBe(false);
}); */

/* describe("App component", () => {
	it("removes an item when clicking the Dismiss button", () => {});
	it("request some initial sotories from an API", () => {});
}); */
