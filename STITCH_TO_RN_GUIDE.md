# Stitch → React Native Expo Conversion Guide

> **Project:** Dashboard (Sulit Tracker / Biyahe Logger)
> **Screens:** Login, Budget Setup, Dashboard, Biyahe Logger, Settings
> **Target:** React Native + Expo (existing `client/` project)

---

## Table of Contents

1. [Core Differences: HTML vs React Native](#1-core-differences-html-vs-react-native)
2. [Design Token Mapping](#2-design-token-mapping)
3. [Element Translation Cheatsheet](#3-element-translation-cheatsheet)
4. [Project Structure](#4-project-structure)
5. [Step 1 – Install Dependencies](#5-step-1--install-dependencies)
6. [Step 2 – Set Up Global Theme & Constants](#6-step-2--set-up-global-theme--constants)
7. [Step 3 – Navigation Setup (Expo Router)](#7-step-3--navigation-setup-expo-router)
8. [Step 4 – Icon Strategy (Replacing Material Symbols)](#8-step-4--icon-strategy-replacing-material-symbols)
9. [Step 5 – Screen-by-Screen Conversion](#9-step-5--screen-by-screen-conversion)
   - [Screen 1: Login](#screen-1-login-screen)
   - [Screen 2: Budget Setup](#screen-2-refined-budget-setup)
   - [Screen 3: Dashboard](#screen-3-dashboard-updated-nav)
   - [Screen 4: Biyahe Logger](#screen-4-biyahe-logger-with-discount)
   - [Screen 5: Settings](#screen-5-settings)
10. [Step 6 – Bottom Navigation Bar (Shared)](#10-step-6--bottom-navigation-bar-shared)
11. [Step 7 – Dark Mode](#11-step-7--dark-mode)
12. [Common Pitfalls](#12-common-pitfalls)

---

## 1. Core Differences: HTML vs React Native

The Stitch output uses **TailwindCSS + HTML**. React Native has no DOM, no CSS classes, and no browser APIs. Here's a high-level mental model:

| Concept               | HTML / Tailwind                      | React Native                                                      |
| --------------------- | ------------------------------------ | ----------------------------------------------------------------- |
| Layout engine         | Flexbox via CSS classes              | Flexbox via `StyleSheet` (default flex-direction is `column`)     |
| Scrolling             | `overflow-y: auto`                   | `<ScrollView>`                                                    |
| Text must be wrapped  | No — free text anywhere              | **Yes** — all text MUST be in `<Text>`                            |
| Clickable anything    | `<button>`, `<a>`                    | `<TouchableOpacity>` or `<Pressable>`                             |
| Input fields          | `<input type="text">`                | `<TextInput>`                                                     |
| Select dropdowns      | `<select>`                           | Third-party picker (e.g. `@react-native-picker/picker`)           |
| Checkboxes / Toggles  | `<input type="checkbox">`            | `<Switch>`                                                        |
| Icons                 | Google Material Symbols font via CDN | `@expo/vector-icons` (Ionicons / MaterialIcons)                   |
| Fonts                 | Google Fonts via `<link>`            | `expo-font` + `useFonts()`                                        |
| Fixed/sticky elements | `position: fixed`                    | `position: 'absolute'` or separate component outside `ScrollView` |
| SVG                   | `<svg>` inline                       | `react-native-svg`                                                |
| Dark mode             | `dark:` Tailwind variants            | `useColorScheme()` hook + conditional styles                      |
| Safe area             | `pb-safe` CSS var                    | `react-native-safe-area-context`                                  |

---

## 2. Design Token Mapping

The designs share one consistent Tailwind config. Map it to a `constants/theme.ts` file:

```typescript
// constants/theme.ts
export const Colors = {
  primary: "#197fe6",
  backgroundLight: "#f6f7f8",
  backgroundDark: "#111921",

  // slate scale (used heavily across all screens)
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate300: "#cbd5e1",
  slate400: "#94a3b8",
  slate500: "#64748b",
  slate700: "#334155",
  slate800: "#1e293b",
  slate900: "#0f172a",

  // semantic
  red500: "#ef4444",
  emerald500: "#10b981",
  orange600: "#ea580c",
  teal600: "#0d9488",
  white: "#ffffff",
};

export const Radius = {
  sm: 4, // DEFAULT (0.25rem)
  md: 8, // lg (0.5rem)
  lg: 12, // xl (0.75rem)
  full: 9999,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
};
```

---

## 3. Element Translation Cheatsheet

```
div (layout)             → <View>
div (scrollable)         → <ScrollView>
p / span / h1-h6         → <Text>
button                   → <TouchableOpacity> or <Pressable>
a (navigation)           → <Pressable onPress={() => router.push('...')}>
input[type="text/email]  → <TextInput>
input[type="number"]     → <TextInput keyboardType="numeric">
input[type="password"]   → <TextInput secureTextEntry>
input[type="checkbox"]   → <Switch>
select                   → <Picker> (@react-native-picker/picker)
form                     → <View> (no native form submission)
header / footer / main   → <View> (semantic tags don't exist in RN)
svg                      → <Svg> from react-native-svg
```

### Tailwind Class → StyleSheet Property Examples

```
flex flex-col            → flexDirection: 'column'   (default, can omit)
flex flex-row            → flexDirection: 'row'
items-center             → alignItems: 'center'
justify-center           → justifyContent: 'center'
justify-between          → justifyContent: 'space-between'
flex-1                   → flex: 1
gap-3                    → gap: 12  (or use margin)
p-4                      → padding: 16
px-4 py-2                → paddingHorizontal: 16, paddingVertical: 8
rounded-xl               → borderRadius: 12
rounded-full             → borderRadius: 9999
shadow-sm                → elevation: 2 (Android) / shadow* props (iOS)
text-sm font-bold        → fontSize: 12, fontWeight: '700'
text-primary             → color: Colors.primary
bg-white                 → backgroundColor: '#ffffff'
border border-slate-200  → borderWidth: 1, borderColor: Colors.slate200
w-full                   → width: '100%'
max-w-md                 → maxWidth: 448
sticky / fixed           → position: 'absolute' + zIndex (or component structure)
space-y-3                → gap: 12 on parent, or marginBottom: 12 on children
truncate                 → numberOfLines={1} on <Text>
```

---

## 4. Project Structure

Create this folder layout inside `client/`:

```
client/
├── app/
│   ├── _layout.tsx          ← Root layout (Expo Router)
│   ├── (auth)/
│   │   └── login.tsx        ← Screen 1
│   └── (tabs)/
│       ├── _layout.tsx      ← Tab navigator
│       ├── index.tsx        ← Screen 3: Dashboard
│       ├── log.tsx          ← Screen 4: Biyahe Logger
│       ├── wallets.tsx      ← Wallets (placeholder)
│       └── settings.tsx     ← Screen 5: Settings
├── components/
│   ├── BottomTabBar.tsx     ← Shared bottom nav
│   ├── CategoryCard.tsx     ← Reusable budget card
│   └── TransactionItem.tsx  ← Reusable transaction row
├── constants/
│   └── theme.ts             ← Design tokens (see Section 2)
├── hooks/
│   └── useTheme.ts          ← Dark mode helper
└── screens/
    └── BudgetSetup.tsx      ← Screen 2 (modal or stack screen)
```

---

## 5. Step 1 – Install Dependencies

```bash
cd client

# Navigation (already have expo-router, but confirm)
npx expo install expo-router

# Safe area (for bottom nav / notch handling)
npx expo install react-native-safe-area-context react-native-screens

# Icons (replaces Material Symbols)
npx expo install @expo/vector-icons

# Fonts (Inter)
npx expo install expo-font @expo-google-fonts/inter

# Picker (replaces <select>)
npx expo install @react-native-picker/picker

# SVG (for the Google login button SVG)
npx expo install react-native-svg
```

---

## 6. Step 2 – Set Up Global Theme & Constants

After creating `constants/theme.ts`, create a hook for dark mode:

```typescript
// hooks/useTheme.ts
import { useColorScheme } from "react-native";
import { Colors } from "../constants/theme";

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return {
    isDark,
    bg: isDark ? Colors.backgroundDark : Colors.backgroundLight,
    card: isDark ? Colors.slate800 : Colors.white,
    border: isDark ? Colors.slate700 : Colors.slate200,
    text: isDark ? Colors.slate100 : Colors.slate900,
    textMuted: isDark ? Colors.slate400 : Colors.slate500,
  };
}
```

---

## 7. Step 3 – Navigation Setup (Expo Router)

The designs show **4 tabs** in the bottom nav: Home, Log, Wallets, Settings.

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Colors } from "../../constants/theme";
import { MaterialIcons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: "#94a3b8",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#e2e8f0",
          paddingBottom: 8,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: "Log",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="receipt-long" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallets"
        options={{
          title: "Wallets",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="account-balance-wallet"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

---

## 8. Step 4 – Icon Strategy (Replacing Material Symbols)

The HTML uses Google Material Symbols as a web font (`<span class="material-symbols-outlined">`). In React Native, use `@expo/vector-icons` with `MaterialIcons` or `MaterialCommunityIcons`.

| Material Symbol (HTML)   | RN Equivalent (`MaterialIcons`) |
| ------------------------ | ------------------------------- |
| `travel_explore`         | `travel-explore`                |
| `mail`                   | `mail`                          |
| `lock`                   | `lock`                          |
| `arrow_back`             | `arrow-back`                    |
| `directions_bus`         | `directions-bus`                |
| `restaurant`             | `restaurant`                    |
| `savings`                | `savings`                       |
| `more_horiz`             | `more-horiz`                    |
| `check_circle`           | `check-circle`                  |
| `home`                   | `home`                          |
| `map`                    | `map`                           |
| `history`                | `history`                       |
| `person`                 | `person`                        |
| `train`                  | `train`                         |
| `local_taxi`             | `local-taxi`                    |
| `fastfood`               | `fastfood`                      |
| `shopping_bag`           | `shopping-bag`                  |
| `payments`               | `payments`                      |
| `bolt`                   | `bolt`                          |
| `menu`                   | `menu`                          |
| `account_circle`         | `account-circle`                |
| `arrow_upward`           | `arrow-upward`                  |
| `percent`                | `percent`                       |
| `radio_button_checked`   | `radio-button-checked`          |
| `location_on`            | `location-on`                   |
| `receipt_long`           | `receipt-long`                  |
| `account_balance_wallet` | `account-balance-wallet`        |
| `settings`               | `settings`                      |
| `edit`                   | `edit`                          |
| `notifications`          | `notifications`                 |
| `language`               | `language`                      |
| `info`                   | `info`                          |
| `description`            | `description`                   |
| `logout`                 | `logout`                        |
| `chevron_right`          | `chevron-right`                 |
| `add`                    | `add`                           |
| `add_circle`             | `add-circle`                    |

**Usage in RN:**

```tsx
import { MaterialIcons } from "@expo/vector-icons";

// Replace: <span class="material-symbols-outlined text-primary">home</span>
// With:
<MaterialIcons name="home" size={24} color={Colors.primary} />;
```

---

## 9. Step 5 – Screen-by-Screen Conversion

---

### Screen 1: Login Screen

**Reference:** `assets/html/01_login_screen.html`
**File:** `app/(auth)/login.tsx`

**Key elements to convert:**

| HTML Element                                                      | RN Replacement                                                                                                        | Notes                                |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `<main class="flex-1 flex flex-col items-center justify-center">` | `<View style={{ flex:1, alignItems:'center', justifyContent:'center', padding:24 }}>`                                 | Use `<SafeAreaView>` as root         |
| Icon logo div                                                     | `<View style={{ width:64, height:64, borderRadius:12, backgroundColor: primaryOpacity10 }}>` + `<MaterialIcons>`      |                                      |
| `<h1>Welcome Back</h1>`                                           | `<Text style={{ fontSize:30, fontWeight:'700' }}>Welcome Back</Text>`                                                 |                                      |
| `<input type="email">` with icon                                  | `<View style={inputContainer}><MaterialIcons/><TextInput keyboardType="email-address" autoCapitalize="none"/></View>` |                                      |
| `<input type="password">`                                         | `<TextInput secureTextEntry={true} />`                                                                                | Add show/hide toggle with `useState` |
| `<button>Login</button>`                                          | `<TouchableOpacity style={primaryButton}><Text>Login</Text></TouchableOpacity>`                                       |                                      |
| Google SVG button                                                 | `<TouchableOpacity>` + `<Svg>` from `react-native-svg` for the Google icon                                            | Or use a PNG asset                   |
| `<footer>` bottom nav                                             | Use Expo Router Tabs — **not rendered on login screen**                                                               | Login is outside tab navigator       |

**Skeleton:**

```tsx
// app/(auth)/login.tsx
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors, Radius } from "../../constants/theme";

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoBox}>
          <MaterialIcons
            name="travel-explore"
            size={36}
            color={Colors.primary}
          />
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue your journey</Text>

        {/* Email */}
        <View style={styles.inputRow}>
          <MaterialIcons
            name="mail"
            size={18}
            color={Colors.slate400}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View style={styles.inputRow}>
          <MaterialIcons
            name="lock"
            size={18}
            color={Colors.slate400}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>

        {/* Google Button */}
        <TouchableOpacity style={styles.secondaryButton}>
          {/* Add Google SVG or PNG here */}
          <Text style={styles.secondaryButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.footerLink}>
          Don't have an account?{" "}
          <Text style={{ color: Colors.primary }}>Create an account</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}
```

---

### Screen 2: Refined Budget Setup

**Reference:** `assets/html/02_refined_budget_setup.html`
**File:** `app/budget-setup.tsx` (stack screen, pushed from Onboarding or Settings)

**Key elements to convert:**

| HTML Element                                                | RN Replacement                                                                                                  | Notes                         |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Top bar with back arrow                                     | `<View style={row}>` + `<TouchableOpacity onPress={() => router.back()}>` + `<MaterialIcons name="arrow-back">` |                               |
| Weekly/Monthly toggle (radio buttons styled as pill toggle) | `useState` + two `<TouchableOpacity>` inside a `<View style={row}>`, highlight active with `backgroundColor`    | No CSS `:checked` trick in RN |
| Large peso amount input                                     | `<TextInput keyboardType="numeric" style={{ fontSize:48, fontWeight:'700' }}>` centered                         |                               |
| Category cards (Transport, Food, etc.)                      | Reusable `<CategoryCard>` component                                                                             | See component below           |
| Inline `<input type="text" value="2,000">` for amounts      | `<TextInput keyboardType="numeric">` with `textAlign: 'right'`                                                  |                               |
| Sticky "Save Budget" footer button                          | Place outside `<ScrollView>`, at bottom of a `<View style={{ flex:1 }}>` layout                                 |                               |

**PillToggle component pattern:**

```tsx
const [freq, setFreq] = useState<"Weekly" | "Monthly">("Monthly");

<View style={styles.toggleContainer}>
  {(["Weekly", "Monthly"] as const).map((option) => (
    <TouchableOpacity
      key={option}
      style={[styles.toggleOption, freq === option && styles.toggleActive]}
      onPress={() => setFreq(option)}
    >
      <Text
        style={[styles.toggleText, freq === option && styles.toggleTextActive]}
      >
        {option}
      </Text>
    </TouchableOpacity>
  ))}
</View>;
```

**CategoryCard component:**

```tsx
// components/CategoryCard.tsx
import { View, Text, TextInput, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  label: string;
  subLabel: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  value: string;
  onChange: (v: string) => void;
};

export function CategoryCard({
  label,
  subLabel,
  icon,
  iconBg,
  iconColor,
  value,
  onChange,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <MaterialIcons name={icon as any} size={22} color={iconColor} />
        </View>
        <View>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.sub}>{subLabel}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.peso}>₱</Text>
        <TextInput
          style={styles.amountInput}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          textAlign="right"
        />
      </View>
    </View>
  );
}
```

**Budget data array (drive the list):**

```tsx
const CATEGORIES = [
  {
    id: "transport",
    label: "Transport",
    sub: "Commute, Grab, Fuel",
    icon: "directions-bus",
    iconBg: "#197fe61a",
    iconColor: Colors.primary,
    default: "2000",
  },
  {
    id: "food",
    label: "Food",
    sub: "Groceries, Dining out",
    icon: "restaurant",
    iconBg: "#ffedd5",
    iconColor: "#ea580c",
    default: "5000",
  },
  {
    id: "savings",
    label: "Savings",
    sub: "Emergency, Travel fund",
    icon: "savings",
    iconBg: "#d1fae5",
    iconColor: "#10b981",
    default: "3000",
  },
  {
    id: "others",
    label: "Others",
    sub: "Miscellaneous",
    icon: "more-horiz",
    iconBg: "#f1f5f9",
    iconColor: Colors.slate600,
    default: "1000",
  },
];
```

---

### Screen 3: Dashboard (Updated Nav)

**Reference:** `assets/html/03_dashboard_updated_nav.html`
**File:** `app/(tabs)/index.tsx`

**Key elements to convert:**

| HTML Element                                 | RN Replacement                                                                                    | Notes                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Sticky top header with menu + title + avatar | `<View style={styles.header}>` at the top — in a non-scrollable parent, it stays at top naturally |                                            |
| Balance section (₱ 12,450.00 + badge)        | `<View style={{ alignItems:'center', paddingVertical:32 }}>`                                      | Large `<Text>` for balance                 |
| `+2.4% vs last month` badge                  | `<View style={emeraldPill}>` + `<MaterialIcons name="arrow-upward">` + `<Text>`                   |                                            |
| Quick Add grid (2 cols)                      | `<FlatList numColumns={2}>` or `flexDirection:'row', flexWrap:'wrap'`                             |                                            |
| Quick Add card buttons                       | `<TouchableOpacity style={quickCard}>`                                                            | Use `Pressable` for pressed-state feedback |
| Recent History list                          | `<FlatList>` or `<ScrollView>` with `TransactionItem` components                                  |                                            |
| Positive amount (green) / Negative (red)     | Conditional `color` in `<Text>` style                                                             |                                            |
| Bottom Tab Nav                               | Handled by Expo Router Tabs `_layout.tsx`                                                         |                                            |

**Quick Add Grid:**

```tsx
const QUICK_ITEMS = [
  { id: "1", label: "LRT / MRT", sub: "Commute", icon: "train" },
  { id: "2", label: "P2P Bus", sub: "Premium Point", icon: "directions-bus" },
  { id: "3", label: "Grab / Taxi", sub: "Ride Hailing", icon: "local-taxi" },
  { id: "4", label: "Snacks", sub: "Food & Drinks", icon: "fastfood" },
];

<FlatList
  data={QUICK_ITEMS}
  numColumns={2}
  keyExtractor={(i) => i.id}
  columnWrapperStyle={{ gap: 12 }}
  scrollEnabled={false}
  renderItem={({ item }) => (
    <TouchableOpacity style={styles.quickCard}>
      <View style={styles.quickIcon}>
        <MaterialIcons
          name={item.icon as any}
          size={22}
          color={Colors.primary}
        />
      </View>
      <Text style={styles.quickLabel}>{item.label}</Text>
      <Text style={styles.quickSub}>{item.sub}</Text>
    </TouchableOpacity>
  )}
/>;
```

**TransactionItem component:**

```tsx
// components/TransactionItem.tsx
type Props = {
  icon: string;
  label: string;
  date: string;
  amount: string;
  isPositive: boolean;
};

export function TransactionItem({
  icon,
  label,
  date,
  amount,
  isPositive,
}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <MaterialIcons name={icon as any} size={20} color={Colors.slate600} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <Text
        style={[
          styles.amount,
          { color: isPositive ? Colors.emerald500 : Colors.red500 },
        ]}
      >
        {isPositive ? "+" : "-"} ₱ {amount}
      </Text>
    </View>
  );
}
```

---

### Screen 4: Biyahe Logger with Discount

**Reference:** `assets/html/04_biyahe_logger_with_discount.html`
**File:** `app/(tabs)/log.tsx`

**Key elements to convert:**

| HTML Element                                                          | RN Replacement                                                                                                                     | Notes                                     |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Sticky header with back + title + history                             | Manual `<View>` at top since this is a tab                                                                                         | Use stack navigator if back nav is needed |
| Map/graphic placeholder with gradient                                 | `<View style={{ borderRadius:12, overflow:'hidden', height:128 }}>` + `<LinearGradient>` from `expo-linear-gradient`               |                                           |
| Today's total info badge                                              | `<View style={[styles.badge, { position:'absolute', bottom:12, left:12 }]}>`                                                       |                                           |
| LRT/MRT horizontal scroll buttons                                     | `<ScrollView horizontal showsHorizontalScrollIndicator={false}>`                                                                   |                                           |
| LRT line selector cards                                               | `<TouchableOpacity style={[styles.lineCard, isActive && styles.lineCardActive]}>`                                                  |                                           |
| Origin / Destination `<select>`                                       | `<Picker>` from `@react-native-picker/picker`                                                                                      | Wrap in a styled `<View>` to match design |
| Route visualizer (radio_button_checked + vertical line + location_on) | `<View style={{ flexDirection:'column', alignItems:'center' }}>` with `<View style={{ width:1, height:32, backgroundColor:... }}>` | Pure View lines                           |
| 50% Discount toggle                                                   | `<Switch value={discount} onValueChange={setDiscount} trackColor={{ true: Colors.primary }} />`                                    | Replaces the CSS `peer-checked` trick     |
| Estimated fare + Log Fare button                                      | `<View style={row}>` with `<Text>` + `<TouchableOpacity>`                                                                          |                                           |
| P2P Bus route cards                                                   | Reusable component, map over array                                                                                                 |                                           |
| Manual amount `<input>`                                               | `<TextInput keyboardType="numeric">` inside a `<View style={inputWrapper}>`                                                        |                                           |

**Discount Toggle (Switch):**

```tsx
import { Switch } from "react-native";
const [discount, setDiscount] = useState(false);

<View
  style={{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  }}
>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
    <MaterialIcons name="percent" size={18} color={Colors.slate400} />
    <Text style={styles.toggleLabel}>Apply 50% Discount</Text>
  </View>
  <Switch
    value={discount}
    onValueChange={setDiscount}
    trackColor={{ false: Colors.slate200, true: Colors.primary }}
    thumbColor={Colors.white}
  />
</View>;
```

**Picker Replacement for `<select>`:**

```tsx
import { Picker } from "@react-native-picker/picker";
const [station, setStation] = useState("");

<View style={styles.pickerWrapper}>
  <Text style={styles.pickerLabel}>ORIGIN STATION</Text>
  <Picker
    selectedValue={station}
    onValueChange={setStation}
    style={styles.picker}
  >
    <Picker.Item label="Select Station" value="" />
    <Picker.Item label="Taft Avenue" value="taft" />
    <Picker.Item label="Gil Puyat" value="gil_puyat" />
    <Picker.Item label="Vito Cruz" value="vito_cruz" />
    <Picker.Item label="Quirino" value="quirino" />
    <Picker.Item label="Carriedo" value="carriedo" />
  </Picker>
</View>;
```

**LRT Line selector with active state:**

```tsx
const LINES = [
  { id: "lrt1", label: "LRT-1", color: "Green" },
  { id: "lrt2", label: "LRT-2", color: "Blue" },
  { id: "mrt3", label: "MRT-3", color: "Yellow" },
  { id: "mrt7", label: "MRT-7", color: "Red" },
];
const [selectedLine, setSelectedLine] = useState("lrt1");

<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  style={{ flexDirection: "row" }}
>
  {LINES.map((line) => (
    <TouchableOpacity
      key={line.id}
      style={[
        styles.lineCard,
        selectedLine === line.id && styles.lineCardActive,
      ]}
      onPress={() => setSelectedLine(line.id)}
    >
      <Text
        style={[
          styles.lineLabel,
          selectedLine === line.id && { color: Colors.primary },
        ]}
      >
        {line.label}
      </Text>
      <Text style={styles.lineColor}>{line.color}</Text>
    </TouchableOpacity>
  ))}
</ScrollView>;
```

---

### Screen 5: Settings

**Reference:** `assets/html/05_settings.html`
**File:** `app/(tabs)/settings.tsx`

**Key elements to convert:**

| HTML Element                                        | RN Replacement                                                                                                   | Notes                               |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Header (back + title)                               | `<View style={header}>` — no back needed as it's a tab                                                           |                                     |
| Profile avatar with edit badge                      | `<Image source={{ uri: profileUrl }}>` + absolute-positioned edit badge `<View>` + `<MaterialIcons name="edit">` | Use `expo-image` for better caching |
| Profile card (name, email, Edit button)             | `<View style={profileCard}>`                                                                                     |                                     |
| Settings rows (Currency, Notifications, Language)   | Reusable `<SettingRow>` component                                                                                | See below                           |
| `<input type="checkbox" checked>` for notifications | `<Switch value={notificationsOn} onValueChange={...} />`                                                         |                                     |
| Chevron `>` for navigable rows                      | `<MaterialIcons name="chevron-right">`                                                                           |                                     |
| App Info rows (About, Terms, Version)               | Same `<SettingRow>` component                                                                                    |                                     |
| Logout red button                                   | `<TouchableOpacity style={styles.logoutButton}>`                                                                 |                                     |
| `pb-24` for tab bar clearance                       | `contentContainerStyle={{ paddingBottom: 80 }}` in `ScrollView`                                                  |                                     |

**SettingRow component:**

```tsx
// components/SettingRow.tsx
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type Props = {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value?: string;
  hasChevron?: boolean;
  rightElement?: React.ReactNode;
  onPress?: () => void;
};

export function SettingRow({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  hasChevron,
  rightElement,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress && !hasChevron}
    >
      <View style={styles.left}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <MaterialIcons name={icon as any} size={20} color={iconColor} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.right}>
        {value && <Text style={styles.value}>{value}</Text>}
        {rightElement}
        {hasChevron && (
          <MaterialIcons name="chevron-right" size={16} color="#94a3b8" />
        )}
      </View>
    </TouchableOpacity>
  );
}
```

**Usage:**

```tsx
<SettingRow
  icon="payments"
  iconBg={`${Colors.primary}1a`}
  iconColor={Colors.primary}
  label="Currency"
  value="PHP (₱)"
  hasChevron
  onPress={() => { /* navigate to currency picker */ }}
/>

<SettingRow
  icon="notifications"
  iconBg="#ffedd5"
  iconColor="#ea580c"
  label="Push Notifications"
  rightElement={
    <Switch
      value={notifs}
      onValueChange={setNotifs}
      trackColor={{ false: Colors.slate200, true: Colors.primary }}
      thumbColor={Colors.white}
    />
  }
/>
```

---

## 10. Step 6 – Bottom Navigation Bar (Shared)

The tab bar is consistent across Screens 3, 4, and 5 (Home, Log, Wallets, Settings). Using **Expo Router Tabs** (see Section 7) automatically handles this — no manual `BottomTabBar` component needed.

**Active tab highlight pattern** from the designs:

- Active: `color: Colors.primary`, icon filled, label `fontWeight: '700'`
- Inactive: `color: Colors.slate400`, icon outlined, label `fontWeight: '400'`

This is controlled via Expo Router's `tabBarActiveTintColor` and `tabBarInactiveTintColor` options.

> **Note:** Screen 1 (Login) and Screen 2 (Budget Setup) do **not** have the bottom tab bar. Login lives in `(auth)` group, and Budget Setup is a stack screen. Expo Router's group-based routing handles this automatically.

---

## 11. Step 7 – Dark Mode

The designs support full dark mode via `dark:` Tailwind classes. In React Native:

```tsx
import { useColorScheme } from "react-native";

// In your component:
const scheme = useColorScheme(); // 'light' | 'dark' | null
const isDark = scheme === "dark";

const styles = StyleSheet.create({
  container: {
    backgroundColor: isDark ? Colors.backgroundDark : Colors.backgroundLight,
  },
  text: {
    color: isDark ? Colors.slate100 : Colors.slate900,
  },
  card: {
    backgroundColor: isDark ? Colors.slate800 : Colors.white,
    borderColor: isDark ? Colors.slate700 : Colors.slate100,
  },
});
```

> **Tip:** Use the `useTheme()` hook from Section 6 to avoid repeating this logic in every screen. Just call `const { bg, card, text, border, isDark } = useTheme();` and spread into styles.

---

## 12. Common Pitfalls

**`position: 'fixed'` does not exist in React Native.**
Use `position: 'absolute'` with `bottom: 0, left: 0, right: 0`. The Expo Router tab bar already handles this correctly.

**Tailwind opacity shortcuts (e.g. `bg-primary/10`) don't exist in RN.**
Use hex with alpha: `#197fe61a` (10% opacity) or `rgba(25, 127, 230, 0.1)`.

**All text must be inside `<Text>`.**
Strings that are children of `<View>` will throw a runtime error. In HTML, free text anywhere is valid — not in RN.

**`<select>` has no native RN equivalent.**
`@react-native-picker/picker` renders differently per platform. On iOS it shows a bottom wheel; on Android it's a dropdown spinner. Consider a custom modal picker for consistent cross-platform UX.

**`backdrop-blur` (frosted glass) requires `expo-blur`.**
Use `<BlurView>` from `expo-blur` to replicate the `backdrop-blur-md` effect seen in the dashboard header and login footer nav.

**`gap` in StyleSheet requires RN 0.71+.**
If on an older version, use `marginBottom` on children or `marginRight` for row gaps instead.

**The `₱` peso sign renders fine in `<Text>` without any setup** — no font loading required for this Unicode character.

---

_Generated from analysis of `assets/html/01-05` Stitch screens — March 2026_
