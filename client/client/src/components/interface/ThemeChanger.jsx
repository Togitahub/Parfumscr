import { useTheme } from "../../hooks/ThemeContext";
import { BsMoonFill, BsSunFill } from "react-icons/bs";

import Button from "../common/Button";

const ThemeChanger = () => {
	const { theme, themes, changeTheme } = useTheme();

	return (
		<div className="flex px-1 py-2 lg:py-0 justify-center items-center">
			{theme === "dark-theme" ? (
				<Button
					iconOnly
					rounded
					variant="ghost"
					icon={<BsSunFill />}
					onClick={() => changeTheme(themes[1])}
				/>
			) : (
				<Button
					iconOnly
					rounded
					variant="ghost"
					icon={<BsMoonFill />}
					onClick={() => changeTheme(themes[0])}
				/>
			)}
		</div>
	);
};

export default ThemeChanger;
