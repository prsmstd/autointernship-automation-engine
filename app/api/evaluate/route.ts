import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { aiEvaluator } from '@/lib/ai-evaluator'
import { generateCertificate } from '@/lib/certificate-generator'

export async function POST(request: NextRequest) {
  try {
    const { taskId, githubLink, userId } = await request.json()

    // Try to use real database if available
    let evaluation: any
    let task: any = null
    let user: any = null

    try {
      const supabase = createSupabaseServerClient()

      // Get task details with domain
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single()

      if (!taskError && taskData) {
        task = taskData
      }

      // Get user details for domain context
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (!userError && userData) {
        user = userData
      }

      // Evaluate submission with AI (enhanced with domain support)
      evaluation = await aiEvaluator.evaluateSubmission(
        githubLink,
        task?.description || 'Complete the assigned project',
        task?.grading_criteria || 'General evaluation criteria',
        task?.domain || user?.domain || 'web_development'
      )

      // Update submission with evaluation results if database is available
      if (task && user) {
        const { error: updateError } = await supabase
          .from('submissions')
          .update({
            ai_feedback: evaluation,
            score: evaluation.overall_score,
            analysis_type: evaluation.analysis_type,
            status: 'evaluated',
            evaluated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('task_id', taskId)

        if (updateError) {
          console.error('Error updating submission:', updateError)
        }

        // If this is the final task and user passed, check if they can get certificate
        if (task.is_final && evaluation.overall_score >= 60) {
          // Check if user has completed all tasks in their domain
          const userDomain = user.domain || task.domain
          const { data: domainTasks } = await supabase
            .from('tasks')
            .select('id')
            .eq('domain', userDomain)
            .order('order_number')

          const { data: userSubmissions } = await supabase
            .from('submissions')
            .select('task_id, score')
            .eq('user_id', userId)
            .eq('status', 'evaluated')

          const passedTasks = userSubmissions?.filter(s => s.score >= 60) || []
          const allTasksPassed = domainTasks?.every(task =>
            passedTasks.some(submission => submission.task_id === task.id)
          )

          if (allTasksPassed) {
            // Check if user has paid
            const { data: payment } = await supabase
              .from('payments')
              .select('*')
              .eq('user_id', userId)
              .eq('status', 'paid')
              .single()

            if (payment) {
              // Generate certificate automatically
              try {
                await generateCertificate(user.email)
              } catch (certError) {
                console.error('Certificate generation error:', certError)
                // Don't fail the evaluation if certificate generation fails
              }
            }
          }
        }
      }
    } catch (dbError) {
      console.log('Database not available, using fallback evaluation')

      // Fallback evaluation when database is not available
      evaluation = await aiEvaluator.evaluateSubmission(
        githubLink,
        'Complete the assigned project',
        'General evaluation criteria',
        'web_development'
      )
    }

    return NextResponse.json({
      success: true,
      evaluation,
      message: 'Submission evaluated successfully',
      analysis_type: evaluation.analysis_type || 'ai_analysis'
    })
  } catch (error) {
    console.error('Evaluation error:', error)
    return NextResponse.json(
      { error: 'Failed to evaluate submission' },
      { status: 500 }
    )
  }
}