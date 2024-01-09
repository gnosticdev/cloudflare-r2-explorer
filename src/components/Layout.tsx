import { Style, css } from 'hono/css'
import { type FC } from 'hono/jsx'

const styles = css`


main {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    gap: 1rem;

    & .table-row {
        background-color: #202b38 !important;
    }
}
audio::-webkit-media-controls-enclosure {
	color-scheme: dark light;
}
td {
	padding: 1rem;
	vertical-align: middle;
}
.uploads, .file-list {
    border: 1px solid #507a98;
    border-radius: 0.5rem;
    padding: 2rem;
}

`

export const Layout: FC = (props) => {
	return (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>R2 Bucket List</title>
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/npm/water.css@2/out/water.css"
				/>
				<Style />
			</head>
			<body class={styles}>{props.children}</body>
		</html>
	)
}
