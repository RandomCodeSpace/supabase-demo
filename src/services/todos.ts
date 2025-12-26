
import { supabase } from '../lib/supabase'

export interface Todo {
    id: number
    user_id: string
    task: string
    is_complete: boolean
    inserted_at: string
}

export const TodoService = {
    async fetchTodos() {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .order('inserted_at', { ascending: false })

        if (error) throw error
        return data as Todo[]
    },

    async addTodo(task: string) {
        const { data, error } = await supabase
            .from('todos')
            .insert([{ task, user_id: (await supabase.auth.getUser()).data.user?.id }])
            .select()

        if (error) throw error
        return data[0] as Todo
    },

    async updateTodo(id: number, updates: Partial<Todo>) {
        const { data, error } = await supabase
            .from('todos')
            .update(updates)
            .eq('id', id)
            .select()

        if (error) throw error
        return data[0] as Todo
    },

    async deleteTodo(id: number) {
        const { error } = await supabase.from('todos').delete().eq('id', id)
        if (error) throw error
    },
}
