export const removeLoading = () => {
  const div = window.document.getElementById('loa-ding')
  if (div) setTimeout(() => (div.style.display = 'none'), 400)
}
