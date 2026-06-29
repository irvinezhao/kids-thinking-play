import re
from urllib.parse import quote

from playwright.sync_api import Page, expect, sync_playwright


BASE_URL = "http://localhost:5173/kids-thinking-play/?testFast=1"
VOICE_TEST_URL = "http://localhost:5173/kids-thinking-play/"


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


def assert_locator_fits_viewport(page: Page, selector: str) -> None:
    box = page.locator(selector).bounding_box()
    viewport = page.viewport_size
    assert box and viewport
    assert box["y"] >= 0, f"{selector} should start inside the viewport"
    assert box["y"] + box["height"] <= viewport["height"] + 1, f"{selector} should fit in the viewport"


def assert_home_visual_centers_aligned(page: Page) -> None:
    delta = page.evaluate(
        """() => {
        const map = document.querySelector('.home-map-card').getBoundingClientRect()
        const grid = document.querySelector('.age-grid').getBoundingClientRect()
        return Math.abs((map.y + map.height / 2) - (grid.y + grid.height / 2))
        }""",
    )
    assert delta < 2, "Home map and age cards should share a horizontal centerline on desktop"


def assert_two_option_grid_centered(page: Page) -> None:
    options = page.locator(".option-button")
    if options.count() != 2:
        return
    grid_box = page.locator(".option-grid").bounding_box()
    first_box = options.first.bounding_box()
    second_box = options.nth(1).bounding_box()
    assert grid_box and first_box and second_box
    grid_center = grid_box["x"] + grid_box["width"] / 2
    buttons_left = min(first_box["x"], second_box["x"])
    buttons_right = max(first_box["x"] + first_box["width"], second_box["x"] + second_box["width"])
    buttons_center = buttons_left + (buttons_right - buttons_left) / 2
    assert abs(buttons_center - grid_center) < 6, "Two-option answers should be centered in the option tray"


def answer_current_question(page: Page) -> None:
    options = page.locator(".option-button")
    count = options.count()
    assert_two_option_grid_centered(page)
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


def assert_question_voice_prompt(page: Page) -> None:
    page.route(
        "**/voice/manifest.json",
        lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"version":2,"defaultVoice":"lovely_girl","cloudTtsUrlTemplate":"/tts/question.mp3?text={text}&id={id}&voice={voice}"}',
        ),
    )
    page.route("**/tts/question.mp3**", lambda route: route.fulfill(status=200, body=""))
    page.add_init_script(
        """
        (() => {
          window.__spokenPrompts = [];
          window.__playedPromptAudio = [];
          HTMLMediaElement.prototype.play = function play() {
            window.__playedPromptAudio.push(this.currentSrc || this.src);
            return Promise.resolve();
          };
          window.SpeechSynthesisUtterance = function SpeechSynthesisUtterance(text) {
            this.text = text;
            this.lang = '';
            this.voice = null;
            this.rate = 1;
            this.pitch = 1;
            this.volume = 1;
          };
          Object.defineProperty(window, 'speechSynthesis', {
            configurable: true,
            value: {
              getVoices: () => [{ lang: 'zh-CN', name: 'Xiaoxiao', localService: true }],
              speak: (utterance) => window.__spokenPrompts.push({
                text: utterance.text,
                lang: utterance.lang,
                voiceName: utterance.voice && utterance.voice.name,
                rate: utterance.rate,
                pitch: utterance.pitch,
              }),
              cancel: () => {},
              addEventListener: () => {},
              removeEventListener: () => {},
            },
          });
        })();
        """,
    )
    page.goto(VOICE_TEST_URL)
    page.wait_for_load_state("networkidle")
    page.evaluate(
        """() => {
        localStorage.clear()
        localStorage.setItem('kids-thinking-play-sound-enabled', 'true')
        }""",
    )
    page.reload()
    page.wait_for_load_state("networkidle")
    page.get_by_role("button", name=re.compile("切换题目音色")).click()
    page.get_by_role("button", name="开始 3-4 岁 练习").click()
    expect(page.locator(".question-area h2")).to_be_visible()
    page.wait_for_function("window.__playedPromptAudio.length > 0")
    visible_prompt = page.locator(".question-area h2").inner_text()
    played_audio = page.evaluate("window.__playedPromptAudio")
    spoken_prompts = page.evaluate("window.__spokenPrompts")
    assert played_audio, "Question prompt should prefer cloud or recorded voice audio"
    assert quote(visible_prompt, safe="") in played_audio[-1], "Voice audio URL should include the visible question"
    assert "voice=cute_boy" in played_audio[-1], "Voice audio URL should include the selected voice"
    assert not spoken_prompts, "System speech should only be a fallback when voice audio is unavailable"
    page.get_by_role("button", name="再读题目").click()
    page.wait_for_function("window.__playedPromptAudio.length > 1")


def run() -> None:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        voice = browser.new_page(viewport={"width": 390, "height": 844})
        assert_question_voice_prompt(voice)
        voice.close()

        desktop = browser.new_page(viewport={"width": 1024, "height": 768})
        desktop.goto(BASE_URL)
        desktop.wait_for_load_state("networkidle")
        desktop.evaluate("localStorage.clear()")
        desktop.reload()
        desktop.wait_for_load_state("networkidle")

        expect(desktop.get_by_role("heading", name="小小思维岛")).to_be_visible()
        expect(desktop.locator(".age-toys")).to_have_count(3)
        desktop.get_by_role("button", name="切换到黑夜模式").click()
        expect(desktop.locator('html[data-theme="night"]')).to_have_count(1)
        desktop.get_by_role("button", name="切换到白天模式").click()
        expect(desktop.locator('html[data-theme="day"]')).to_have_count(1)
        expect(desktop.locator('html[data-font="zhanku"]')).to_have_count(1)
        desktop.get_by_role("button", name=re.compile("切换字体")).click()
        expect(desktop.locator('html[data-font="jinnian"]')).to_have_count(1)
        desktop.get_by_role("button", name=re.compile("切换字体")).click()
        expect(desktop.locator('html[data-font="pingfang"]')).to_have_count(1)
        desktop.get_by_role("button", name=re.compile("切换字体")).click()
        expect(desktop.locator('html[data-font="qingsong"]')).to_have_count(1)
        desktop.get_by_role("button", name=re.compile("切换字体")).click()
        expect(desktop.locator('html[data-font="zhanku"]')).to_have_count(1)
        expect(desktop.get_by_role("button", name="开始 2-3 岁 练习")).to_be_visible()
        expect(desktop.get_by_role("button", name="开始 3-4 岁 练习")).to_be_visible()
        expect(desktop.get_by_role("button", name="开始 4-5 岁 练习")).to_be_visible()
        assert_no_scroll(desktop)
        assert_home_visual_centers_aligned(desktop)

        desktop.get_by_role("button", name="题库").click()
        expect(desktop.get_by_role("heading", name="题库导入与审核")).to_be_visible()
        assert_no_scroll(desktop)
        desktop.get_by_role("button", name="填入样例").click()
        desktop.get_by_role("button", name="导入", exact=True).click()
        expect(desktop.get_by_text("已导入 1 道题")).to_be_visible()
        desktop.get_by_role("button", name="全部通过").click()
        expect(desktop.get_by_text("所有导入题已审核通过")).to_be_visible()
        assert_locator_fits_viewport(desktop, ".panel-screen")
        desktop.get_by_role("button", name="返回").click()
        desktop.screenshot(path="/tmp/kids-thinking-home-desktop.png", full_page=True)
        desktop.close()

        mobile = browser.new_page(viewport={"width": 390, "height": 844})
        mobile.goto(BASE_URL)
        mobile.wait_for_load_state("networkidle")
        assert_no_scroll(mobile)

        mobile.get_by_role("button", name="开始 2-3 岁 练习").click()
        first_session_ids = []
        for question_number in range(1, 11):
            expect(mobile.locator(".quiz-title strong")).to_contain_text(f"{question_number} / 10")
            assert_no_scroll(mobile)
            question_id = mobile.locator(".question-area").get_attribute("data-question-id")
            assert question_id, "Question should expose a stable id for replay de-duplication"
            first_session_ids.append(question_id)
            answer_current_question(mobile)

        expect(mobile.get_by_text("完成")).to_be_visible(timeout=2000)
        expect(mobile.get_by_text("10 / 10")).to_be_visible()
        expect(mobile.get_by_role("button", name="玩更多")).to_be_visible()
        assert_no_scroll(mobile)

        mobile.get_by_role("button", name="玩更多").click()
        for question_number in range(1, 11):
            expect(mobile.locator(".quiz-title strong")).to_contain_text(f"{question_number} / 10")
            assert_no_scroll(mobile)
            question_id = mobile.locator(".question-area").get_attribute("data-question-id")
            assert question_id not in first_session_ids, "Play-more session should avoid the previous round"
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
        assert_locator_fits_viewport(mobile, ".panel-screen")
        mobile.screenshot(path="/tmp/kids-thinking-parent-mobile.png", full_page=True)

        mobile.get_by_role("button", name="返回").click()
        mobile.get_by_role("button", name="题库").click()
        expect(mobile.get_by_role("heading", name="题库导入与审核")).to_be_visible()
        assert_no_scroll(mobile)
        assert_locator_fits_viewport(mobile, ".panel-screen")
        mobile.screenshot(path="/tmp/kids-thinking-admin-mobile.png", full_page=True)

        mobile.close()
        browser.close()


if __name__ == "__main__":
    run()
