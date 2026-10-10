export interface PrivacySection {
  id: string
  title: string
  content: string
}

export interface PrivacyPolicyData {
  sections: PrivacySection[]
}
