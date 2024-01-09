import { ClientContext } from '@/index'
import { html } from 'hono/html'
import { useContext, type FC } from 'hono/jsx'

export const UploadForm: FC = () => {
	const context = useContext(ClientContext)
	return (
		<form
			id="upload-form"
			method="post"
			enctype="multipart/form-data"
			action="/api/upload"
		>
			<label htmlFor="key">
				File ID:
				<input type="text" name="key" id="key" required />
			</label>
			<input type="file" name="file" id="file" />
			<button type="submit">Upload</button>
			<div id="upload-message">{context.uploadMessage}</div>
			<script>
				{html`const form = document.getElementById('upload-form')
                form.elements.namedItem('file').addEventListener('change', (e) => {
                    const file = e.target.files[0]
                    const key = form.elements.namedItem('key')
                    key.value = file.name.replace(/\.[^/.]+$/, '')
                })
                function returnFileSize(number) {
                    if (number < 1024) {
                      return number.toStrin() + ' bytes';
                    } else if (number >= 1024 && number < 1048576) {
                      return (number / 1024).toFixed(1).toString() + ' KB';
                    } else if (number >= 1048576) {
                      return (number / 1048576).toFixed(1).toString() + ' MB';
                    }
                }
                form.elements.namedItem('file').addEventListener('change', (e) => {
                    const file = e.target.files[0]
                    const fileSize = returnFileSize(file.size)
                    const message = document.getElementById('upload-message')
                    message.innerHTML = \`File size: \${fileSize}\`
                })
                `}
			</script>
		</form>
	)
}
