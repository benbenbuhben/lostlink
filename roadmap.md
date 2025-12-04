# LostLink MVP Road-map

> Date created: {{DATE}}
> Last updated: {{TODAY}}

## 1. High-level App Structure

| Area | Description |
|------|-------------|
| Navigation | Expo Router with bottom-tab layout |
| Tabs | 1. **Feed** (`/`) – default after login<br>2. **Report** (`/report`) – add found item<br>3. **Search** (`/search`) – keyword + location filter<br>4. **Profile** (`/profile`) – optional (logout, claims) |
| Modal Routes | • `/item/[id]` – item detail + *Submit Claim*<br>• `/claim-sent` – confirmation<br>• `/login` – deep-link landing after Auth0 |

## 2. Screen-by-Screen UX Notes

### Feed (Tab 1)
* Scrollable list (FlashList) with infinite scroll.
* Pull-to-refresh, optimistic prepend on WebSocket `new_item`.
* Each card: photo thumb, title, location chip, relative time.
* FAB (Paper) bottom-right → *Report* form.

### Report Found Item (Tab 2)
* Required: photo, title, location.
* Stepped form **or** single scroll; disabled *Submit* until valid.
* Photo picker → crop square.
* Optimistic card appears in Feed while POST + MinIO upload runs.

### Search / Filter (Tab 3)
* Search field in app-bar (debounced).
* Horizontal location chips or modal picker.
* Clears to Feed list underneath.

### Item Detail (modal `/item/[id]`)
* Hero photo, metadata.
* *Submit Claim* button (disabled when logged-out).

### Claim Sent (`/claim-sent`)
* Success icon + message.
* Button → *Back to Feed*.

### Profile (optional)
* Avatar, email, logout, future claims history.

## 3. Visual & Theming
* Primary `#2979ff`, accent teal.
* Cards elevation 1-2; 16 px gutters, 8 px radius.
* Dark mode via React Native Paper theme.

## 4. Data / State Flow
* **AuthContext** – userInfo + JWT. _(implemented)_
* **React Query** – cache `/items`, pagination, mutations. ✅ _integrated for Feed_
* **WebSocket** `/ws/items` – real-time item adds. _(pending)_
* Forms: local state ➜ mutation ➜ invalidate queries.

## 5. Error & Empty States
* Feed empty illustration.
* Offline banner (NetInfo).
* Inline form errors & global Snackbar.

## 6. Accessibility & Polish
* 44 px touch targets.
* `accessibilityLabel` on icon buttons.
* Subtle fade-in animations for new cards.

## 7. Implementation Sprint Order
- [x] Wire router + tabs.
- [~] Auth flow & AuthContext. _(frontend complete; backend token validation pending)_
- [x] Feed list (mock → API).
- [x] Report form (photo upload via MinIO).
- [x] Item detail & claim POST.
- [x] Search / filter UI.
- [.] WebSocket real-time updates.
- [x] Polish (loading skeletons, pull-to-refresh, empty/error states).
- [x] Accessibility & dark mode QA.
- [x] End-to-end happy-path test.

## 8. Acceptance Criteria Trace
| PRD Section | Covered By |
|-------------|-----------|
| Auth Flow   | Sprint 2 |
| Report Item | Sprint 4 |
| Feed/Search | Sprints 3 & 6 |
| Claim Flow  | Sprint 5 |
| Responsive UI & Polish | Sprint 8 & 9 |
| Deployment  | Out-of-scope for roadmap (handled via Docker & CI) |

---

This roadmap should evolve; feel free to append sprint notes and check-boxes as tasks are completed.
