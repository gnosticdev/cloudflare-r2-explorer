import { UploadForm } from '@/components/Upload'
import { ClientContext } from '@/index'
import type { R2ObjectWithMetadata } from '@/types'
import { html } from 'hono/html'
import { Fragment, useContext, type FC } from 'hono/jsx'

export const R2BucketList: FC = () => {
	const { r2Objects, uploadMessage } = useContext(ClientContext)
	return (
		<Fragment>
			<main>
				<div class="uploads">
					<h2>Upload Files</h2>
					<UploadForm message={uploadMessage} />
				</div>
				<div class="file-list">
					<h2>{r2Objects.objects.length} Audio Files</h2>
					<div id="audio-container">
						{/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
						<audio id="audio-source" controls />
					</div>
					<table>
						<tr>
							<th>File Key</th>
							<th>File Name</th>
							<th>File Type</th>
							<th>File Size</th>
							<th>Play</th>
						</tr>
						{r2Objects.objects.length > 0 &&
							r2Objects.objects.map(
								async ({ key, customMetadata }: R2ObjectWithMetadata) => (
									<tr class="table-row">
										<td>
											<a href={`api/download/${key}`}>{key}</a>
										</td>
										<td>{customMetadata.fileName ?? ''}</td>
										<td>{customMetadata.fileType ?? ''}</td>
										<td>{customMetadata.fileSize ?? ''}</td>
										<td>
											<button type="button" id={`button_${key}`}>
												Play
											</button>
											<script>
												{html`
                                                    document.getElementById('button_${key}').addEventListener('click', playAudio)
                                                    async function playAudio(e) {
                                                        console.log('fetching audio file for ${key}')
                                                        const target = e.target
                                                        const key = target.dataset.key
                                                        const res = await fetch('/api/load/${key}')
                                                        const blob = await res.blob()
                                                        const fileUrl = URL.createObjectURL(blob)
                                                        // insert audio into DOM
                                                        const audioElement = document.createElement('audio')
                                                        audioElement.src = fileUrl
                                                        audioElement.controls = true
                                                        // replace main audio source
                                                        const mainAudio = document.getElementById('audio-source')
                                                        mainAudio.src = fileUrl
                                                    }
                                                `}
											</script>
										</td>
									</tr>
								)
							)}
					</table>
				</div>
			</main>
		</Fragment>
	)
}

async function playAudio(e) {
	const target = e.target
	const key = target.dataset.key
	const res = await fetch('/api/load/${key}')
	const blob = await res.blob()
	const fileUrl = URL.createObjectURL(blob)
	// insert audio into DOM
	const audioElement = document.createElement('audio')
	audioElement.src = fileUrl
	audioElement.controls = true
	// replace main audio source
	const mainAudio = document.getElementById('audio-container')
	// insert audio element
	mainAudio.replaceChild(audioElement, mainAudio.firstChild)
}

const AsyncAudioScript = async () => {
	return <script>{html`${unescapeHtml}`}</script>
}

function unescapeHtml(escapedHtml: string) {
	return escapedHtml.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}
