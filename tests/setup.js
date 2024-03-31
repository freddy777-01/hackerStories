import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import matchers from "@testing-library/jest-dom/types/matchers";
import { expect } from "vitest";

expect.extend(matchers);

//runs a cleanup after each test case (e.g clearing jsdom)
afterEach(() => {
	cleanup();
});
