import Image from "next/image";
import React, { useEffect, useState } from "react";
import Button from '../components/Button';
import chromeLogo from '../public/chrome-logo.png'
import type { Session } from 'next-auth';

export type BannerHeightType = "h-12" | "h-24" | "h-32" | "h-40" | "h-44" | undefined;
type BannerSituation = "not-installed" | "incompatible-browser" | "incompatible-device" | null;

const Banner = ({ bannerHeight, setBannerHeight }: {
	bannerHeight: BannerHeightType,
	setBannerHeight: React.Dispatch<React.SetStateAction<BannerHeightType>>
}) => {
	const chromeExtensionLink = "https://chrome.google.com/webstore/detail/vibinex/jafgelpkkkopeaefadkdjcmnicgpcncc";
	const [bannerHTML, setBannerHTML] = useState((<></>));
	const [session, setSession] = useState<Session | null>(null);
	useEffect(() => {
		fetch("/api/auth/session", { cache: "no-store" }).then(async (res) => {
			const sessionVal = await res.json();
			setSession(sessionVal);
		});
	}, [])

	useEffect(() => {
		const setBanner = (situation: BannerSituation) => {
			switch (situation) {
				case "not-installed":
					setBannerHeight(() => {
						const bannerHeight = 32;
						setBannerHTML((<>
							<p className='text-center text-xl w-fit sm:max-w-1/2 h-fit my-auto'>
								Browser extension is not installed
							</p>
							<Button id="add-to-chrome-btn" variant="outlined" href={chromeExtensionLink} target="_blank" className='h-fit text-center p-3 sm:p-4 px-20 rounded-lg font-bold text-[20px] my-auto ml-4'>
								<Image src={chromeLogo} alt="chrome extension logo" className={`w-10 inline mr-2 border border-white rounded-full`}></Image>
								Download the extension
							</Button>
						</>))
						return `h-${bannerHeight}`;
					})
					break;
				case "incompatible-browser":
					setBannerHeight(() => {
						const bannerHeight = 24;
						setBannerHTML((<>
							<Image src={chromeLogo} alt="chrome extension logo" className={`w-12 inline mr-8 m-6 border border-white rounded-full`}></Image>
							<p className='text-center font-bold text-xl w-fit sm:max-w-1/2 h-fit my-auto'>
								Vibinex is only supported in Chromium browsers<br />
								<span className='text-sm font-normal'>Google Chrome, Microsoft Edge, Opera, Chromium, Brave etc.</span>
							</p>
						</>))
						return `h-${bannerHeight}`;
					})
					break;
				case "incompatible-device":
					setBannerHeight(() => {
						const bannerHeight = 12;
						setBannerHTML((<>
							<p className='text-center text-sm sm:text-xl w-fit sm:max-w-1/2 h-fit my-auto'>
								Browser extensions are not supported on this device.
							</p>
						</>))
						return `h-${bannerHeight}`;
					})
					break;
				default:
					// either user is not logged in, or Vibinex extension is already installed
					setBannerHeight(() => {
						setBannerHTML((<></>))
						return undefined;
					})
					break;
			}
		}

		const determineSituation = (): BannerSituation => {
            const isUnsupportedDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
			// currently, this is the best way to check if browser extensions are supported. Ref: https://stackoverflow.com/a/60927213/4677052
			if (session && session.user) {
				if ('chrome' in window && !isUnsupportedDevice) {
					return null;
				} else if (isUnsupportedDevice) {
					return "incompatible-device";
				} else {
					return "incompatible-browser";
				}
			} else {
				return null;
			}
		}
		const situation = determineSituation();
		setBanner(situation);
	}, [session,setBannerHeight])

	return (<div className={`w-full ${bannerHeight} bg-primary-main flex justify-center align-middle text-primary-light`} >
		{(bannerHeight) ? bannerHTML : null}
	</div>)
}

export default Banner;