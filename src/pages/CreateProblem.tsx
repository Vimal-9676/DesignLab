import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Save, ArrowLeft } from 'lucide-react'
import { ProblemService } from '../services/ProblemService'
import type { Problem, Difficulty } from '../domain/types'

export default function CreateProblem() {
  const navigate = useNavigate()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  
  const handleSave = () => {
    if (!title) return
    const newProblem = ProblemService.addCustomProblem({
      title,
      difficulty: 'Medium',
      estimatedMinutes: 60,
      concepts: [],
      shortDescription: description || 'Custom project',
      statement: description || 'Design a custom system for ' + title,
      requirements: ['Define core entities', 'Design API'],
      assumptions: [],
      constraints: [],
      thinkingPrompts: [],
      designConsiderations: [],
      keywordsForEvaluation: [],
    })
    
    navigate(`/problems/${newProblem.id}`)
  }

  return (
    <main className="page-container max-w-3xl">
      <button onClick={() => navigate('/problems')} className="btn-ghost -ml-3 mb-4 inline-flex">
        <ArrowLeft className="w-4 h-4" />
        Back to Problems
      </button>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Custom Project</h1>
          <p className="text-gray-500 mt-1">
            Describe a project you want to practice.
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Ticket Booking System, Netflix Clone..."
              className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Any specific features or focus areas you want to include?"
              className="form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={handleSave}
              disabled={!title}
              className="btn-primary flex-1 sm:flex-none justify-center"
            >
              <Save className="w-4 h-4" />
              Save Custom Project
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
