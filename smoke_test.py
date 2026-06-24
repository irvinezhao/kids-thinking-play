from playwright.sync_api import Page, expect, sync_playwright


BASE_URL = "http://localhost:5173/?testFast=1"


def assert_no_scroll(page: Page) -> None:
    has_scroll = page.evaluate(
        """() =>
        document.documentElement.scrollHeight > window.innerHeight + 1 ||
        document.body.scrollHeight > window.innerHeight + 1
        """,
    )
    assert not has_scroll, "Page should fit in the viewport without a vertical scrollbar"


def assert_feedback_centered(page: Page) -> None:
    box = page.locator(".feedback").bounding_box()
    viewport = page.viewport_size
    assert box and viewport
    feedback_center_y = box["y"] + box["height"] / 2
    page_center_y = viewport["height"] / 2
    assert abs(feedback_center_y - page_center_y) < 12, "Feedback should be vertically centered"


def answer_current_question(page: Page) -> None:
    options = page.locator(".option-button")
    count = options.count()
    for index in range(count):
        button = options.nth(index)
        expect(button).to_be_enabled(timeout=1500)
        button.click()
        expect(page.locator(".feedback")).to_be_visible(timeout=1500)
        assert_feedback_centered(page)
        class_name = button.get_attribute("class") or ""
        if "is-correct" in class_name:
            page.wait_for_timeout(180)
            return
        expect(options.first).to_be_enabled(timeout=1500)
    raise AssertionError("No correct option found for current question")


def run() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        desktop = browser.new_page(viewport={"width": 1024, "height": 768})
        desktop.goto(BASE_URL)
        desktop.wait_for_load_state("networkidle")
        desktop.evaluate("localStorage.clear()")
        desktop.reload()
        desktop.wait_for_load_state("networkidle")

        expect(desktop.get_by_role("heading", name="小小思维岛")).to_be_visible()
        expect(desktop.get_by_text("题库 120 道 · 今日 10 题")).to_have_count(3)
        expect(desktop.get_by_role("button", name="开始 2-3 岁 练习")).to_be_visible()
        expect(desktop.get_by_role("button", name="开始 3-4 岁 练习")).to_be_visible()
        expect(desktop.get_by_role("button", name="开始 4-5 岁 练习")).to_be_visible()
        assert_no_scroll(desktop)

        desktop.get_by_role("button", name="题库").click()
        expect(desktop.get_by_role("heading", name="题库导入与审核")).to_be_visible()
        assert_no_scroll(desktop)
        desktop.get_by_role("button", name="填入样例").click()
        desktop.get_by_role("button", name="导入", exact=True).click()
        expect(desktop.get_by_text("已导入 1 道题")).to_be_visible()
        desktop.get_by_role("button", name="全部通过").click()
        expect(desktop.get_by_text("所有导入题已审核通过")).to_be_visible()
        desktop.get_by_role("button", name="返回").click()
        desktop.screenshot(path="/tmp/kids-thinking-home-desktop.png", full_page=True)
        desktop.close()

        mobile = browser.new_page(viewport={"width": 390, "height": 844})
        mobile.goto(BASE_URL)
        mobile.wait_for_load_state("networkidle")
        assert_no_scroll(mobile)

        mobile.get_by_role("button", name="开始 2-3 岁 练习").click()
        for question_number in range(1, 11):
            expect(mobile.locator(".quiz-title strong")).to_contain_text(f"{question_number} / 10")
            assert_no_scroll(mobile)
            answer_current_question(mobile)

        expect(mobile.get_by_text("完成")).to_be_visible(timeout=2000)
        expect(mobile.get_by_text("10 / 10")).to_be_visible()
        assert_no_scroll(mobile)
        mobile.screenshot(path="/tmp/kids-thinking-smoke-mobile.png", full_page=True)

        mobile.get_by_role("button", name="换年龄").click()
        mobile.get_by_role("button", name="家长").click()
        expect(mobile.get_by_role("heading", name="练习记录")).to_be_visible()
        expect(mobile.get_by_text("能力雷达")).to_be_visible()
        expect(mobile.get_by_text("今日练习")).to_be_visible()
        assert_no_scroll(mobile)
        mobile.screenshot(path="/tmp/kids-thinking-parent-mobile.png", full_page=True)

        mobile.close()
        browser.close()


if __name__ == "__main__":
    run()
