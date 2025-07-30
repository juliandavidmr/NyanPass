import analytics from "@react-native-firebase/analytics";

export function logAnalyticsEvent(
	eventName: string,
	eventParams?: Record<string, string | number>
) {
	return analytics().logEvent(eventName, eventParams);
}
