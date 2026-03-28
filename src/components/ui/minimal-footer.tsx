import {
	FacebookIcon,
	GithubIcon,
	Activity,
	InstagramIcon,
	LinkedinIcon,
	TwitterIcon,
	YoutubeIcon,
} from 'lucide-react';

export function MinimalFooter() {
	const year = new Date().getFullYear();

	const company = [
		{ title: 'About Us', href: '#about' },
		{ title: 'Technology', href: '#architecture' },
		{ title: 'Privacy Policy', href: '#' },
		{ title: 'Terms of Service', href: '#' },
	];

	const resources = [
		{ title: 'Documentation', href: '#' },
		{ title: 'Help Center', href: '#' },
		{ title: 'API Reference', href: '#' },
		{ title: 'GitHub', href: 'https://github.com/Abhishek222983101/CogniStream' },
	];

	const socialLinks = [
		{ icon: <GithubIcon className="size-4" strokeWidth={2} />, link: 'https://github.com/Abhishek222983101/CogniStream' },
		{ icon: <TwitterIcon className="size-4" strokeWidth={2} />, link: 'https://twitter.com/Abhishekislinux' },
		{ icon: <LinkedinIcon className="size-4" strokeWidth={2} />, link: '#' },
	];

	return (
		<footer className="relative">
			<div className="bg-paper mx-auto max-w-6xl border-clinical">
				<div className="grid grid-cols-6 gap-6 p-6 md:p-8">
					<div className="col-span-6 flex flex-col gap-4 md:col-span-4">
						<a href="/" className="w-max flex items-center gap-2 text-charcoal hover:text-cobalt transition-colors">
							<Activity className="size-7" strokeWidth={2} />
							<span className="font-heading text-xl font-bold uppercase tracking-tight">CogniStream</span>
						</a>
						<p className="text-charcoal/60 font-mono text-sm leading-relaxed max-w-sm">
							AI-powered clinical trial matching engine with transparent, explainable reasoning. 
							Reducing screening time from 30+ minutes to under 15 seconds.
						</p>
						<div className="flex gap-2">
							{socialLinks.map((item, i) => (
								<a
									key={i}
									className="border-clinical bg-white p-2 hover:bg-charcoal hover:text-white transition-colors"
									target="_blank"
									rel="noopener noreferrer"
									href={item.link}
								>
									{item.icon}
								</a>
							))}
						</div>
					</div>
					<div className="col-span-3 w-full md:col-span-1">
						<span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal/40 mb-2 block">
							Resources
						</span>
						<div className="flex flex-col gap-1">
							{resources.map(({ href, title }, i) => (
								<a
									key={i}
									className="w-max py-1 text-sm font-mono text-charcoal/70 hover:text-cobalt transition-colors"
									href={href}
									target={href.startsWith('http') ? '_blank' : undefined}
									rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
								>
									{title}
								</a>
							))}
						</div>
					</div>
					<div className="col-span-3 w-full md:col-span-1">
						<span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal/40 mb-2 block">
							Company
						</span>
						<div className="flex flex-col gap-1">
							{company.map(({ href, title }, i) => (
								<a
									key={i}
									className="w-max py-1 text-sm font-mono text-charcoal/70 hover:text-cobalt transition-colors"
									href={href}
								>
									{title}
								</a>
							))}
						</div>
					</div>
				</div>
				<div className="border-clinical-t flex flex-col justify-between gap-2 px-6 py-4">
					<p className="text-charcoal/40 text-center font-mono text-xs">
						© {year} Team Paradigm. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
