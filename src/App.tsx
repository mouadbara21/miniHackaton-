import { useMemo, useRef, useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, Bell, ChevronDown, Cloud, FileArchive, FileImage, FileText, Folder, LayoutGrid, List, LogOut, MoreHorizontal, Search, Settings, ShieldCheck, Star, UploadCloud, X } from 'lucide-react'
import './App.css'

type VaultFile = { id: number; name: string; type: 'PDF' | 'PNG' | 'ZIP' | 'DOCX'; size: string; updated: string; color: string }
const initialFiles: VaultFile[] = [
  { id: 1, name: 'Project brief.pdf', type: 'PDF', size: '2.4 MB', updated: 'Today, 09:42', color: 'coral' },
  { id: 2, name: 'Brand assets.zip', type: 'ZIP', size: '18.7 MB', updated: 'Yesterday, 16:20', color: 'gold' },
  { id: 3, name: 'Team portrait.png', type: 'PNG', size: '6.1 MB', updated: 'Sep 18, 2026', color: 'mint' },
  { id: 4, name: 'Research notes.docx', type: 'DOCX', size: '842 KB', updated: 'Sep 17, 2026', color: 'sky' },
]
const fileIcon = (type: VaultFile['type']) => type === 'PNG' ? <FileImage size={19} /> : type === 'ZIP' ? <FileArchive size={19} /> : <FileText size={19} />

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [files, setFiles] = useState(initialFiles)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All files')
  const [upload, setUpload] = useState<{ name: string; progress: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const visibleFiles = useMemo(() => files.filter((file) => file.name.toLowerCase().includes(query.toLowerCase()) && (activeFilter === 'All files' || file.type === activeFilter.slice(0, -1).toUpperCase())), [activeFilter, files, query])
  const handleUpload = (file?: File) => {
    if (!file) return
    setUpload({ name: file.name, progress: 12 })
    let progress = 12
    const timer = window.setInterval(() => {
      progress += 22
      if (progress >= 100) {
        window.clearInterval(timer); setUpload(null)
        setFiles((current) => [{ id: Date.now(), name: file.name, type: file.name.toLowerCase().endsWith('.zip') ? 'ZIP' : file.name.toLowerCase().endsWith('.png') ? 'PNG' : 'PDF', size: `${(file.size / 1024 / 1024).toFixed(1)} MB`, updated: 'Just now', color: 'coral' }, ...current])
      } else setUpload({ name: file.name, progress })
    }, 420)
  }
  const download = (file: VaultFile) => { const url = URL.createObjectURL(new Blob([`Demo download for ${file.name}`], { type: 'text/plain' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = file.name; anchor.click(); URL.revokeObjectURL(url) }
  if (!isSignedIn) return <main className="auth-shell"><div className="auth-visual"><div className="logo"><span>V</span> vault</div><div className="visual-copy"><p className="eyebrow">Private file storage</p><h1>Your files,<br /><em>in their element.</em></h1><p>One calm, secure place for the work that matters. Built for teams who value clarity.</p></div><div className="orb orb-one" /><div className="orb orb-two" /><div className="auth-note"><ShieldCheck size={16} /> End-to-end ready architecture</div></div><section className="auth-panel"><div className="auth-heading"><p className="eyebrow">Welcome back</p><h2>Sign in to your vault</h2><p>Access your files and keep your team moving.</p></div><form onSubmit={(event) => { event.preventDefault(); setIsSignedIn(true) }}><label>Email address<input type="email" defaultValue="alex@studio.co" required /></label><label>Password<div className="password-field"><input type="password" defaultValue="password" required /><button type="button" className="text-button">Forgot?</button></div></label><button className="primary-button" type="submit">Continue <ArrowUpFromLine size={17} /></button></form><div className="auth-divider"><span>or</span></div><button className="secondary-button" onClick={() => setIsSignedIn(true)}>Continue with Google</button><p className="fine-print">By continuing, you agree to our Terms and Privacy Policy.</p></section></main>

  return (
    <main className="app-shell"><aside className="sidebar"><div className="logo"><span>V</span> vault</div><nav><a className="active"><LayoutGrid size={17} /> Overview</a><a><Folder size={17} /> My files <span className="nav-count">{files.length}</span></a><a><Star size={17} /> Starred</a></nav><div className="sidebar-bottom"><a><Settings size={17} /> Settings</a><a onClick={() => setIsSignedIn(false)}><LogOut size={17} /> Sign out</a><div className="profile"><div className="avatar">AC</div><div><strong>Alex Chen</strong><small>Personal workspace</small></div><MoreHorizontal size={16} /></div></div></aside><section className="workspace"><header><div className="mobile-logo logo"><span>V</span> vault</div><div className="crumb"><span>Workspace</span><ChevronDown size={14} /></div><div className="header-actions"><button className="icon-button" title="Notifications"><Bell size={18} /></button><div className="header-avatar">AC</div></div></header><div className="content"><div className="page-intro"><div><p className="eyebrow">Monday, September 21, 2026</p><h1>Good morning, Alex <span>✦</span></h1><p>Here’s what’s happening in your workspace.</p></div><button className="primary-button" onClick={() => inputRef.current?.click()}><UploadCloud size={17} /> Upload files</button></div><div className="stats"><div><span>Storage used</span><strong>2.4 <small>GB</small></strong><div className="meter"><i style={{ width: '24%' }} /></div><small>of 10 GB</small></div><div><span>Total files</span><strong>{files.length + 24}</strong><small className="trend">↑ 12% this month</small></div><div><span>Shared with you</span><strong>8</strong><small className="trend">↑ 3 this week</small></div><div className="plan-card"><div><span>Current plan</span><strong>Personal</strong></div><button>Upgrade <ArrowUpFromLine size={14} /></button></div></div><div className="section-heading"><div><h2>Recent files</h2><p>Everything you’ve added or opened lately.</p></div><button className="view-all">View all <ArrowUpFromLine size={15} /></button></div>{upload && <div className="upload-status"><div className="upload-icon"><Cloud size={19} /></div><div className="upload-details"><strong>Uploading {upload.name}</strong><div className="upload-track"><i style={{ width: `${upload.progress}%` }} /></div></div><span>{upload.progress}%</span><button onClick={() => setUpload(null)}><X size={16} /></button></div>}<div className="toolbar"><div className="search-box"><Search size={17} /><input placeholder="Search files" value={query} onChange={(event) => setQuery(event.target.value)} /></div><div className="filters">{['All files', 'PDFs', 'Images', 'Archives'].map((filter) => <button className={activeFilter === filter ? 'selected' : ''} onClick={() => setActiveFilter(filter)} key={filter}>{filter}</button>)}</div><button className="icon-button"><List size={18} /></button><button className="icon-button muted"><LayoutGrid size={18} /></button></div><div className="file-table"><div className="table-head"><span>Name</span><span>Size</span><span>Last modified</span><span /></div>{visibleFiles.map((file) => <div className="file-row" key={file.id}><div className="file-name"><div className={`file-icon ${file.color}`}>{fileIcon(file.type)}</div><div><strong>{file.name}</strong><small>{file.type} file</small></div></div><span>{file.size}</span><span>{file.updated}</span><button className="download-button" title={`Download ${file.name}`} onClick={() => download(file)}><ArrowDownToLine size={17} /></button></div>)}{visibleFiles.length === 0 && <div className="empty-state">No files match your search.</div>}</div><div className="dropzone" onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); handleUpload(event.dataTransfer.files[0]) }}><div className="drop-icon"><UploadCloud size={20} /></div><div><strong>Drop files here to upload</strong><p>or <span>browse from your computer</span> · up to 100 MB per file</p></div></div><input ref={inputRef} hidden type="file" onChange={(event) => handleUpload(event.target.files?.[0])} /></div></section></main>
  )
}

export default App
