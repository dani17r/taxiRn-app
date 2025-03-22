/* eslint-disable */
import type { DialogI, SuperFormT, SuperInputT, SuperInputUnionT } from '@/interfaces/global'

import type { UnwrapNestedRefs, VNodeRef } from 'vue'
import { reactive, ref } from 'vue'

const modelInput = <SuperInputUnionT>{
  rules: [],
  value: null,
  copy: null,
  ref: {},
  error: {
    status: false,
    on: function () {
      this.status = true
    },
    off: function () {
      this.status = false
    },
  },
  set(val: any) {
    this.copy = val
    this.value = val
  },
  isChange() {
    const value = JSON.stringify(this.value)
    const copy = JSON.stringify(this.copy)
    return value != copy
  },
  validate() {
    if (this.ref?.validate) return !this.ref.validate()
    else return false
  },
  isErrors() {
    if (this.ref?.hasError) {
      return this.ref.hasError
    } else return false
  },
  reset: function () {
    if (this.isChange()) this.value = this.copy
    if (this.ref?.resetValidation) setTimeout(() => this.ref.resetValidation())
  },
}

export const superInputs = <T>(data: T) => {
  const inputs = reactive(data as SuperInputT<T>) as SuperInputT<T>

  for (const key in inputs) {
    inputs[key].copy = inputs[key].value
    inputs[key] = {
      ...modelInput,
      ...inputs[key],
    }
  }
  return inputs
}

export const superForm = <T>(data: T): SuperFormT<T> => {
  const inputs = superInputs(data)
  const reference = ref<VNodeRef | null>(null)

  return reactive(<SuperFormT<T>>{
    ...(inputs as SuperInputUnionT),
    checkValidation() {
      for (const key in inputs) {
        if (this[key].validate()) return true
      }
      return false
    },
    checkIsErrors() {
      for (const key in inputs) {
        if (this[key].isErrors()) return true
      }
      return false
    },
    reset() {
      for (const key in inputs) {
        this[key].reset()
        this[key].error.off()
      }
    },
    update() {
      for (const key in inputs) {
        this[key].copy = this[key].value
        this[key].reset()
      }
    },
    updateForm(payload: any) {
      for (const key in inputs) {
        const value = payload as any
        this[key].set(value[key])
      }
    },
    verifyIsNotChanges() {
      for (const key in inputs) {
        if (this[key].isChange()) return true
      }
      return false
    },
    getValues() {
      const data = <any>{}
      for (const key in inputs) {
        data[key] = this[key].value
      }
      return data
    },
    getRef(val: VNodeRef | undefined) {
      reference.value = val
    },
    resetValidation() {
      this.reset()
      setTimeout(() => reference.value?.resetValidation(), 100)
    },
    validate() {
      const result = ref(false)
      reference.value?.validate().then((val: boolean) => (result.value = val))
      return result.value
    },
  }) as unknown as SuperFormT<T>
}

export const superModals = <T extends object>(data: T) => {
  const modals = reactive({
    ...data,
    toggle(name: keyof UnwrapNestedRefs<T>): boolean {
      return (modals[name] = !modals[name] as never)
    },
  })
  return modals
}

export const superToggle = (val = false) =>
  reactive({
    value: val,
    toggle(): boolean {
      return (this.value = !this.value)
    },
  })

interface SuperMultiModalI<Status> {
  id?: string | null
  status: Status
  value?: boolean
}

export const superMultiModal = <Status = string>({
  id = null,
  status,
  value = false,
}: SuperMultiModalI<Status>) =>
  reactive({
    value: value,
    id: <any>id,
    status: status,
    toggle(value = status) {
      this.status = value as Status
      this.value = !this.value
    },
    changeId(id: SuperMultiModalI<Status>['id']) {
      if (id == null) this.id = id
      else if (id != this.id) this.id = id
    },
  }) as DialogI<Status>

export const superModal = ({ id = <any>null, value = false }) =>
  reactive({
    value: value,
    id: <any>id,
    toggle() {
      this.value = !this.value
    },
    changeId(id: string) {
      if (id == null && id) this.id = id
      else if (id != this.id && id) this.id = id
    },
  })
